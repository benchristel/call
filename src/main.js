const peer = new Peer(generateId());

const micPromise = new Promise((resolve, reject) => {
  const getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia  

  getUserMedia(
    {audio: true, video: false},
    stream => resolve(stream),
    err => reject(err),
  )
}).catch(err => console.error("Could not get microphone audio", err))

if (window.location.hash.length > 1) {
  // We're being invited to a call, and the host's Peer ID is in the URL hash.
  // Call them.
  document.getElementById("guest").style.display = "block"
  const hostId = window.location.hash.slice(1)
  micPromise.then(micStream => {
    const call = peer.call(hostId, micStream)
    call.on('stream', remoteStream => {
      playStream(remoteStream)
      document.getElementById("guest").style.display = "none"
    })
  })
} else {
  // We're starting a brand-new call. Wait for our partner to connect, and
  // reply to them with our mic audio
  peer.on('call', function(call) {
    micPromise.then(micStream => {
      call.answer(micStream)
    })
    call.on('stream', playStream)
  })
  const inviteLink = String(window.location) + "#" + peer.id
  document.getElementById("link").value = inviteLink
  document.getElementById("copy").onclick = () => navigator.clipboard.writeText(inviteLink)
  document.getElementById("host").style.display = "block"
}

function playStream(audioStream) {
  const audio = new Audio()
  audio.srcObject = audioStream
  audio.play()
}

function generateId() {
  const array = new Uint32Array(3)
  crypto.getRandomValues(array)
  return array.join("")
}
