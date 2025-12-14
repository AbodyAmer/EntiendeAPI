require('dotenv').config();

const structuredData = {
    text: "أنا قصير",
    id_voice: "ac_voice_xyz1408",
    input_mode: "0",
    // performance_id: "1587",
    // dialect_id: "7"
};

        // {
        //     "dialect_id": 3,
        //     "display_name": "السعودية (الحجازية)"
        // },
        // {
        //     "dialect_id": 7,
        //     "display_name": "المصرية (القاهرية)"
        // },

fetch('https://lahajati.ai/api/v1/text-to-speech-absolute-control', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + process.env.ARABIC_AUDIO,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
    },
    body: JSON.stringify(structuredData)
})
.then(response => {
    console.log('Response status:', response);
    return response.blob()
})
.then(blob => console.log('Structured audio received!'))
.catch(error => console.error('Error:', error));