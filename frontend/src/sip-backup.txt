import JsSIP from 'jssip';

const KAMAILIO_WS = (import.meta.env.VITE_KAMAILIO_WS || '')
  .replace(/^https?:\/\//, '')
  .replace(/^wss?:\/\//, '');
const KAMAILIO_HOST = import.meta.env.VITE_KAMAILIO_HOST || '192.168.56.10';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

let ua = null;
let currentSession = null;
let onStatusUpdate = null;
let onIncomingCall = null;
let remoteAudio = null;
let onCallEndGlobal = null;

function getOrCreateAudio() {
  if (!remoteAudio) {
    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    document.body.appendChild(remoteAudio);
  }
  return remoteAudio;
}

function attachRemoteStream(stream, remoteVideoRef, isVideo) {
  console.log('[SIP] Attaching remote stream, isVideo:', isVideo);
  if (isVideo && remoteVideoRef?.current) {
    remoteVideoRef.current.srcObject = stream;
    remoteVideoRef.current.play().catch(e => console.error('[VIDEO] Remote play error:', e));
  } else {
    const audio = getOrCreateAudio();
    audio.srcObject = stream;
    audio.play().catch(e => console.error('[AUDIO] Play error:', e));
  }
}

function attachPeerConnection(session, remoteVideoRef, isVideo) {
  session.on('peerconnection', ({ peerconnection }) => {
    console.log('[ICE] PeerConnection created');

    peerconnection.oniceconnectionstatechange = () => {
      console.log('[ICE] State:', peerconnection.iceConnectionState);
    };

    peerconnection.onicegatheringstatechange = () => {
      console.log('[ICE] Gathering:', peerconnection.iceGatheringState);
    };

    peerconnection.ontrack = (event) => {
      console.log('[ICE] Got track:', event.track.kind, '| streams:', event.streams.length);
      if (event.streams && event.streams[0]) {
        attachRemoteStream(
          event.streams[0],
          remoteVideoRef,
          isVideo && event.track.kind === 'video'
        );
      }
    };
  });
}

function attachSessionEvents(session, onCallStatus, remoteVideoRef, localVideoRef, isVideo) {
  session.on('progress', () => {
    console.log('[SIP] Ringing');
    onCallStatus?.('Ringing....');
  });

  session.on('accepted', () => {
    console.log('[SIP] Call Accepted');
    onCallStatus?.('In Call....');
  });

  session.on('confirmed', () => {
    console.log('[SIP] Call Confirmed');
    onCallStatus?.('In Call....');
    if (isVideo) {
      _attachLocalStream(localVideoRef);
    }
  });

  session.on('ended', (e) => {
    console.log('[SIP] Call Ended:', e.cause);
    onCallStatus?.('Call Ended');
    onCallEndGlobal?.();
    _cleanupStream(localVideoRef);
    if (remoteAudio) remoteAudio.srcObject = null;
  });

  session.on('failed', (e) => {
    console.error('[SIP] Call Failed:', e.cause);
    onCallStatus?.('Call Failed: ' + e.cause);
    onCallEndGlobal?.();
    _cleanupStream(localVideoRef);
  });
}

export function initSIP({ number, password, onStatus, onIncoming, onCallEnd }) {
  if (ua) {
    ua.stop();
    ua = null;
  }

  onStatusUpdate = onStatus;
  onIncomingCall = onIncoming;
  onCallEndGlobal = onCallEnd;

  JsSIP.debug.disable('JsSIP:*');

  const socket = new JsSIP.WebSocketInterface(`wss://${KAMAILIO_WS}`);

  ua = new JsSIP.UA({
    sockets: [socket],
    uri: `sip:${number}@${KAMAILIO_HOST}`,
    password: password,
    display_name: number,
    register: true,
    register_expires: 300,
    contact_uri: `sip:${number}@${KAMAILIO_HOST}`,
  });

  ua.on('registered', () => {
    console.log('[SIP] Registered:', number);
    onStatusUpdate?.({ type: 'registered', message: 'Terdaftar ke Kamailio' });
  });

  ua.on('registrationFailed', (e) => {
    console.error('[SIP] Registration Failed:', e.cause);
    onStatusUpdate?.({ type: 'error', message: 'Gagal daftar ke Kamailio: ' + e.cause });
  });

  ua.on('disconnected', () => {
    console.warn('[SIP] Disconnected');
    onStatusUpdate?.({ type: 'disconnected', message: 'Koneksi SIP terputus' });
  });

  ua.on('newRTCSession', ({ session, originator }) => {
    if (originator === 'remote') {
      currentSession = session;
      const callerNumber = session.remote_identity.uri.user;
      console.log('[SIP] Incoming call from:', callerNumber);

      session.on('peerconnection', ({ peerconnection }) => {
        console.log('[ICE] Incoming PeerConnection created');
        peerconnection.oniceconnectionstatechange = () => {
          console.log('[ICE] Incoming State:', peerconnection.iceConnectionState);
        };
        peerconnection.onicegatheringstatechange = () => {
          console.log('[ICE] Incoming Gathering:', peerconnection.iceGatheringState);
        };
        peerconnection.ontrack = (event) => {
          console.log('[ICE] Incoming track:', event.track.kind);
          if (event.streams && event.streams[0]) {
            const audio = getOrCreateAudio();
            audio.srcObject = event.streams[0];
            audio.play().catch(e => console.error('[AUDIO] Incoming play error:', e));
          }
        };
      });

      onIncomingCall?.({
        number: callerNumber,
        session: session,
        answer: (isVideo) => answerCall(isVideo),
        reject: () => rejectCall(),
      });

      session.on('ended', (e) => {
        console.log('[SIP] Remote ended call:', e.cause);
        onCallEndGlobal?.();
        if (remoteAudio) remoteAudio.srcObject = null;
      });

      session.on('failed', (e) => {
        console.error('[SIP] Call failed:', e.cause);
        onCallEndGlobal?.();
      });

      setTimeout(() => {
        if (session.status === JsSIP.RTCSession.C.STATUS_WAITING_FOR_ANSWER) {
          console.log('[SIP] Auto-reject after 30s');
          session.terminate();
        }
      }, 30000);
    }
  });

  ua.start();
  console.log('[SIP] UA Starting...');
}

export function makeCall({ targetNumber, isVideo = false, onCallStatus, remoteVideoRef, localVideoRef }) {
  if (!ua || !ua.isRegistered()) {
    console.warn('[SIP] Not registered');
    onCallStatus?.('Tidak terdaftar ke Kamailio');
    return null;
  }

  const target = `sip:${targetNumber}@${KAMAILIO_HOST}`;
  console.log('[SIP] Calling:', target, '| video:', isVideo);

  const options = {
    mediaConstraints: { audio: true, video: isVideo },
    pcConfig: { iceServers: ICE_SERVERS },
    rtcOfferConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: isVideo,
    },
  };

  currentSession = ua.call(target, options);
  attachPeerConnection(currentSession, remoteVideoRef, isVideo);
  attachSessionEvents(currentSession, onCallStatus, remoteVideoRef, localVideoRef, isVideo);
  return currentSession;
}

export function answerCall(isVideo = false, remoteVideoRef = null, localVideoRef = null, onCallStatus = null) {
  if (!currentSession) return;
  console.log('[SIP] Answering call | video:', isVideo);

  attachPeerConnection(currentSession, remoteVideoRef, isVideo);

  navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo })
    .then(localStream => {
      console.log('[SIP] Got local stream for answer | tracks:', localStream.getTracks().length);

      if (isVideo && localVideoRef?.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(e => console.error('[VIDEO] Local play error:', e));
        console.log('[SIP] Local video attached for answerer');
      }

      currentSession.answer({
        mediaConstraints: { audio: true, video: isVideo },
        pcConfig: { iceServers: ICE_SERVERS },
        rtcAnswerConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideo,
        },
      });

      attachSessionEvents(currentSession, onCallStatus, remoteVideoRef, localVideoRef, isVideo);
    })
    .catch(err => {
      console.error('[SIP] getUserMedia failed for answer:', err);
      currentSession.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: ICE_SERVERS },
      });
      attachSessionEvents(currentSession, onCallStatus, remoteVideoRef, localVideoRef, false);
    });
}

export function rejectCall() {
  if (!currentSession) return;
  currentSession.terminate({ status_code: 486, reason_phrase: 'Busy Here' });
  currentSession = null;
}

export function endCall() {
  if (!currentSession) return;
  try { currentSession.terminate(); } catch {}
  currentSession = null;
  if (remoteAudio) remoteAudio.srcObject = null;
}

export function toggleMute(muted) {
  if (!currentSession) return;
  if (muted) {
    currentSession.mute({ audio: true, video: false });
    console.log('[SIP] Muted');
  } else {
    currentSession.unmute({ audio: true, video: false });
    console.log('[SIP] Unmuted');
  }
}

export function toggleCamera(videoOn) {
  if (!currentSession) return;
  if (videoOn) {
    currentSession.unmute({ audio: false, video: true });
    console.log('[SIP] Camera on');
  } else {
    currentSession.mute({ audio: false, video: true });
    console.log('[SIP] Camera off');
  }
}

export function disconnectSIP() {
  if (ua) {
    ua.stop();
    ua = null;
  }
}

export function isRegistered() {
  return ua?.isRegistered() || false;
}

async function _attachLocalStream(localRef) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef?.current) {
      localRef.current.srcObject = stream;
      localRef.current.play().catch(e => console.error('[VIDEO] Local play error:', e));
      console.log('[SIP] Local camera attached');
    }
  } catch (e) {
    console.error('[SIP] Camera error:', e);
  }
}

function _cleanupStream(localRef) {
  if (localRef?.current?.srcObject) {
    localRef.current.srcObject.getTracks().forEach(t => t.stop());
    localRef.current.srcObject = null;
    console.log('[SIP] Local stream cleaned');
  }
}