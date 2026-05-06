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

export function initSIP({ number, password, onStatus, onIncoming }) {
  if (ua) {
    ua.stop();
    ua = null;
  }

  onStatusUpdate = onStatus;
  onIncomingCall = onIncoming;

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
      onIncomingCall?.({
        number: callerNumber,
        session: session,
        answer: (isVideo) => answerCall(isVideo),
        reject: () => rejectCall(),
      });
      setTimeout(() => {
        if (session.status === JsSIP.RTCSession.C.STATUS_WAITING_FOR_ANSWER) {
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
  console.log('[SIP] Calling:', target);

  const options = {
    mediaConstraints: { audio: true, video: isVideo },
    pcConfig: { iceServers: ICE_SERVERS },
    rtcOfferConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: isVideo,
    },
  };

  currentSession = ua.call(target, options);

  currentSession.on('progress', () => {
    console.log('[SIP] Ringing');
    onCallStatus?.('Ringing....');
  });

  currentSession.on('accepted', () => {
    console.log('[SIP] Call Accepted');
    onCallStatus?.('In Call....');
  });

  currentSession.on('confirmed', () => {
    console.log('[SIP] Call Confirmed');
    onCallStatus?.('In Call....');
    _attachStream(remoteVideoRef, localVideoRef, isVideo);
  });

  currentSession.on('ended', (e) => {
    console.log('[SIP] Call Ended:', e.cause);
    onCallStatus?.('Call Ended');
    _cleanupStream(localVideoRef);
  });

  currentSession.on('failed', (e) => {
    console.error('[SIP] Call Failed:', e.cause);
    onCallStatus?.('Call Failed: ' + e.cause);
    _cleanupStream(localVideoRef);
  });

  currentSession.on('peerconnection', ({ peerconnection }) => {
    peerconnection.ontrack = (event) => {
      if (remoteVideoRef?.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  });

  return currentSession;
}

export function answerCall(isVideo = false) {
  if (!currentSession) return;
  currentSession.answer({
    mediaConstraints: { audio: true, video: isVideo },
    pcConfig: { iceServers: ICE_SERVERS },
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
}

export function toggleMute(muted) {
  if (!currentSession) return;
  if (muted) {
    currentSession.mute({ audio: true, video: false });
  } else {
    currentSession.unmute({ audio: true, video: false });
  }
}

export function toggleCamera(videoOn) {
  if (!currentSession) return;
  if (videoOn) {
    currentSession.unmute({ audio: false, video: true });
  } else {
    currentSession.mute({ audio: false, video: true });
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

function _attachStream(remoteRef, localRef, isVideo) {
  if (isVideo && localRef?.current) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localRef.current) localRef.current.srcObject = stream;
      })
      .catch(err => console.error('[SIP] Camera error:', err));
  }
}

function _cleanupStream(localRef) {
  if (localRef?.current?.srcObject) {
    localRef.current.srcObject.getTracks().forEach(t => t.stop());
    localRef.current.srcObject = null;
  }
}