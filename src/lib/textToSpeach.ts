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

    const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
            /Female|Google UK English Female|Zira|Samantha/i.test(voice.name)
        );

        if (femaleVoice) utterance.voice = femaleVoice;

        utterance.rate = options.rate ?? 0.7;
        utterance.pitch = options.pitch ?? 1.8;
        utterance.volume = options.volume ?? 1;
        utterance.lang = options.lang ?? 'en-US';

        if (options.onEnd) utterance.onend = options.onEnd;

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
};