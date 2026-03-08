interface QuickSpeakOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
    onEnd?: () => void;
}

export const quickSpeak = (text: string, options: QuickSpeakOptions = {}) => {

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();

    const femaleVoice = voices.find(voice =>
        voice.name.includes('Female') ||
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Zira') ||  // Windows
        voice.name.includes('Samantha') // macOS/iOS
    );

    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }

    utterance.rate = options.rate ?? 0.7;
    utterance.pitch = options.pitch ?? 1.8;
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? 'en-US';

    utterance.onend = () => {
        if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
};