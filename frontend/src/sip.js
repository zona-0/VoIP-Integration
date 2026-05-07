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
let onCallEndGlobal = null;
let remoteAudio = null;
let localStreamRef = null;

function getOrCreateAudio() {
  if (!remoteAudio) {
    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    document.body.appendChild(remoteAudio);
  }
  return remoteAudio;
}

function attachPeerConnection(session, remoteVideoRef, isVideo) {
  session.on('peerconnection', ({ peerconnection }) => {
    console.log('[ICE] PeerConnection created | isVideo:', isVideo);

    peerconnection.oniceconnectionstatechange = () => {
      console.log('[ICE] State:', peerconnection.iceConnectionState);
    };

    peerconnection.ontrack = (event) => {
      const kind = event.track.kind;
      console.log('[ICE] Got remote track:', kind);

      if (kind === 'audio') {
        const audio = getOrCreateAudio();
        if (!audio.srcObject) {
          audio.srcObject = event.streams[0];
        } else {
          const stream = audio.srcObject;
          event.streams[0].getAudioTracks().forEach(t => stream.addTrack(t));
        }
        audio.play().catch(e => console.error('[AUDIO] Play error:', e));
        console.log('[AUDIO] Remote audio attached');
      }

      if (kind === 'video' && isVideo && remoteVideoRef?.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(e => console.error('[VIDEO] Remote play error:', e));
        console.log('[VIDEO] Remote video attached');
      }
    };
  });
}

function attachSessionEvents(session, onCallStatus, localVideoRef, isVideo) {
  session.on('progress', () => {
    console.log('[SIP] Ringing');
    onCallStatus?.('Ringing....');
  });

  session.on('accepted', () => {
    console.log('[SIP] Accepted');
    onCallStatus?.('In Call....');
  });

  session.on('confirmed', () => {
    console.log('[SIP] Confirmed');
    onCallStatus?.('In Call....');
  });

  session.on('ended', (e) => {
    console.log('[SIP] Ended:', e.cause);
    onCallStatus?.('Call Ended');
    onCallEndGlobal?.();
    _cleanupLocalStream();
    if (remoteAudio) remoteAudio.srcObject = null;
  });

  session.on('failed', (e) => {
    console.error('[SIP] Failed:', e.cause);
    onCallStatus?.('Call Failed: ' + e.cause);
    onCallEndGlobal?.();
    _cleanupLocalStream();
  });
}

export function initSIP({ number, password, onStatus, onIncoming, onCallEnd }) {
  if (ua) { ua.stop(); ua = null; }

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
      console.log('[SIP] Incoming from:', callerNumber);

      onIncomingCall?.({
        number: callerNumber,
        session: session,
        answer: (isVideo) => answerCall(isVideo),
        reject: () => rejectCall(),
      });

      session.on('ended', (e) => {
        console.log('[SIP] Remote ended:', e.cause);
        onCallEndGlobal?.();
        if (remoteAudio) remoteAudio.srcObject = null;
        _cleanupLocalStream();
      });

      session.on('failed', (e) => {
        console.error('[SIP] Call failed:', e.cause);
        onCallEndGlobal?.();
        _cleanupLocalStream();
      });

      setTimeout(() => {
        if (session.status === JsSIP.RTCSession.C.STATUS_WAITING_FOR_ANSWER) {
          console.log('[SIP] Auto-reject: no answer after 30s');
          session.terminate();
          onCallEndGlobal?.();
        }
      }, 30000);
    }
  });

  ua.start();
  console.log('[SIP] UA Starting...');
}

export function makeCall({ targetNumber, isVideo = false, onCallStatus, remoteVideoRef, localVideoRef }) {
  if (!ua || !ua.isRegistered()) {
    onCallStatus?.('Tidak terdaftar ke Kamailio');
    return null;
  }

  const target = `sip:${targetNumber}@${KAMAILIO_HOST}`;
  console.log('[SIP] Calling:', target, '| video:', isVideo);

  if (remoteAudio) remoteAudio.srcObject = null;

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
  attachSessionEvents(currentSession, onCallStatus, localVideoRef, isVideo);

  if (isVideo) {
    currentSession.on('confirmed', () => {
      _attachLocalStream(localVideoRef);
    });
  }

  return currentSession;
}

export function answerCall(isVideo = false, remoteVideoRef = null, localVideoRef = null, onCallStatus = null) {
  if (!currentSession) return;
  console.log('[SIP] Answering | video:', isVideo);

  if (remoteAudio) remoteAudio.srcObject = null;

  attachPeerConnection(currentSession, remoteVideoRef, isVideo);

  navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo })
    .then(stream => {
      console.log('[SIP] Got local stream | tracks:', stream.getTracks().map(t => t.kind));
      localStreamRef = stream;

      if (isVideo && localVideoRef?.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.error('[VIDEO] Local play error:', e));
      }

      currentSession.answer({
        mediaConstraints: { audio: true, video: isVideo },
        pcConfig: { iceServers: ICE_SERVERS },
        rtcAnswerConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideo,
        },
      });

      attachSessionEvents(currentSession, onCallStatus, localVideoRef, isVideo);
    })
    .catch(err => {
      console.error('[SIP] getUserMedia failed:', err);
      currentSession.answer({
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: ICE_SERVERS },
      });
      attachSessionEvents(currentSession, onCallStatus, localVideoRef, false);
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
  _cleanupLocalStream();
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
  if (!localStreamRef) {
    console.warn('[SIP] No local stream for camera toggle');
    return;
  }
  localStreamRef.getVideoTracks().forEach(track => {
    track.enabled = videoOn;
    console.log('[SIP] Camera track', videoOn ? 'enabled' : 'disabled');
  });
}

export function disconnectSIP() {
  if (ua) { ua.stop(); ua = null; }
}

export function isRegistered() {
  return ua?.isRegistered() || false;
}

async function _attachLocalStream(localRef) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef = stream;
    if (localRef?.current) {
      localRef.current.srcObject = stream;
      localRef.current.play().catch(e => console.error('[VIDEO] Local play error:', e));
      console.log('[SIP] Local camera attached for caller');
    }
  } catch (e) {
    console.error('[SIP] Camera error:', e);
  }
}

function _cleanupLocalStream() {
  if (localStreamRef) {
    localStreamRef.getTracks().forEach(t => t.stop());
    localStreamRef = null;
    console.log('[SIP] Local stream cleaned');
  }
}