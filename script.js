const peerConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
            ],
        },
    ],
};
const btnCreateOffer = document.getElementById("createOffer");
const offerText = document.getElementById("localOffer");
const localIceCandidate = document.getElementById("localIceCandidates");
const localVedioElement = document.getElementById("localStream");

const remoteVedioElement = document.getElementById("remoteStream");

const remoteICeCandidate = document.getElementById("remoteIceCandidate");
const remoteOffer = document.getElementById("remoteOffer");

const btnSetRemoteAnswer = document.getElementById("setRemoteAnswer");

const btnSetRemoteIceCandidate = document.getElementById(
    "setRemoteIceCandidate"
);
const btnSetRemoteOffer = document.getElementById("setRemoteOffer");

const answerText = document.getElementById("answer");
const remoteAnswer = document.getElementById("remoteAnswer");

//check boxes

const createOfferCheck = document.getElementById("create-offer-checkbox");
const createOfferLabel = document.getElementById("create-offer-label");

const setRemoteOfferCheck = document.getElementById("set-remote-offer-check");

const setRemoteOfferLabel = document.getElementById("set-remote-offer-label");

const setRemoteAnsCheck = document.getElementById("set-remote-answer-check");

const setRemoteAnsLabel = document.getElementById("set-remote-answer-label");

const setRemoteIceCandidateCheck = document.getElementById(
    "set-remote-icecandidate-check"
);

const setRemoteIceCandidateLabel = document.getElementById(
    "set-remote-icecandidate-label"
);

let peerConnection;
let dataChannel;

const init = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
        video: { width: 300, height: 300 },
    });
    localVedioElement.srcObject = localStream;

    peerConnection = new RTCPeerConnection(peerConfiguration);

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    const channel = peerConnection.createDataChannel("chat");

    channel.onopen = (e) => {
        channel.send("hi me");
    };

    channel.onmessage = (e) => {
        console.log(e.data);
    };

    peerConnection.ondatachannel = (e) => {
        const channel = e.channel;
        channel.onopen = (e) => {
            channel.send("hi back");
        };

        channel.onmessage = (e) => {
            console.log(e.data);
        };
    };

    peerConnection.ontrack = handleOnTrack;

    peerConnection.onicecandidate = handleOnIcecandidate;

    btnCreateOffer.addEventListener("click", createOffer);

    btnSetRemoteOffer.addEventListener("click", handleSetRemoteOffer);

    btnSetRemoteIceCandidate.addEventListener(
        "click",
        handleSetRemoteIceCandidate
    );

    btnSetRemoteAnswer.addEventListener("click", handleSetRemoteAns);
};

const createOffer = async () => {
    try {
        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);
        offerText.value = JSON.stringify(peerConnection.localDescription);

        //dom man
        createOfferCheck.checked = true;

        btnCreateOffer.disabled = true;

        btnCreateOffer.classList.add("blur");

        createOfferLabel.classList.add("blur");

        setRemoteOfferLabel.classList.add("blur", "overline");

        remoteOffer.disabled = true;

        remoteOffer.classList.add("blur");

        btnSetRemoteOffer.disabled = true;

        btnSetRemoteOffer.classList.add("blur");

        answerText.disabled = true;

        answerText.classList.add("blur");
    } catch (error) {
        console.error("Error creating offer:", error);
    }
};

init();

const handleSetRemoteAns = () => {
    const answer = remoteAnswer.value;

    if (!answer) return;

    peerConnection.setRemoteDescription(JSON.parse(answer));
    console.log("remote answer set");

    //dom man
    btnSetRemoteAnswer.disabled = true;

    btnSetRemoteAnswer.classList.add("blur");

    setRemoteAnsCheck.checked = true;

    setRemoteAnsLabel.classList.add("blur");
};

const handleSetRemoteIceCandidate = async () => {
    const iceCandidates = remoteICeCandidate.value.split("\n");

    if (!iceCandidates.length) return;

    console.log("ice candidate is ");
    console.log(iceCandidates);

    iceCandidates.forEach((candidate) => {
        if (candidate) {
            peerConnection
                .addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)))
                .then((ans) => console.log("added ice ", ans))
                .catch((err) => console.error(err));
        }
    });

    //dom man

    btnSetRemoteIceCandidate.disabled = true;

    btnSetRemoteIceCandidate.classList.add("blur");

    setRemoteIceCandidateCheck.checked = true;

    setRemoteIceCandidateLabel.classList.add("blur");
};

const handleSetRemoteOffer = () => {
    console.log("setting remote ice candidate");

    const offer = remoteOffer.value;

    if (!offer) return;

    peerConnection.setRemoteDescription(JSON.parse(offer));

    peerConnection
        .createAnswer()
        .then((answer) => {
            console.log("answer is ");
            console.log(answer);
            peerConnection.setLocalDescription(answer);
            answerText.value = JSON.stringify(answer) + "\n";
        })
        .then(() => {
            //dom man

            btnSetRemoteOffer.disabled = true;

            btnSetRemoteOffer.classList.add("blur");

            btnCreateOffer.disabled = true;

            btnCreateOffer.classList.add("blur");

            offerText.disabled = true;

            offerText.classList.add("blur");

            btnSetRemoteAnswer.disabled = true;

            btnSetRemoteAnswer.classList.add("blur");

            remoteAnswer.disabled = true;

            remoteAnswer.classList.add("blur");

            createOfferLabel.classList.add("blur", "overline");

            setRemoteAnsLabel.classList.add("blur", "overline");

            setRemoteOfferLabel.classList.add("blur");

            setRemoteOfferCheck.checked = true;
        });
};

const handleOnIcecandidate = (e) => {
    console.log("ICE candidate found");
    console.log(e);
    if (e.candidate) {
        localIceCandidate.value += JSON.stringify(e.candidate) + "\n";
    }
};

const handleOnTrack = (e) => {
    const [data] = e.streams;
    remoteVedioElement.srcObject = data;
};
