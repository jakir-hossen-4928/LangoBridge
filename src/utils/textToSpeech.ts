// Text-to-Speech utility for Korean language
export const speakKorean = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR'; // Korean language
        utterance.rate = 0.9; // Slightly slower for better pronunciation
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Text-to-speech not supported in this browser');
    }
};

export const stopSpeech = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

// Check if TTS is available
export const isTTSAvailable = (): boolean => {
    return 'speechSynthesis' in window;
};
