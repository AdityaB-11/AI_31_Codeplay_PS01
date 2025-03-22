// Speech recognition utility
export const startSpeechRecognition = (
  onResult: (transcript: string) => void,
  onEnd: () => void
): (() => void) => {
  // Check if browser supports speech recognition
  if (typeof window === 'undefined') {
    console.error('Speech recognition is only available in browser environments');
    onEnd();
    return () => {};
  }
  
  // Access the speech recognition API with proper fallbacks
  // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    onEnd();
    return () => {};
  }
  
  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      // Make sure we have results before trying to process them
      if (event.results && event.results.length > 0) {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        onResult(transcript);
      }
    };
    
    recognition.onend = () => {
      onEnd();
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      onEnd();
    };
    
    // Try to start recognition
    recognition.start();
    
    // Return a function to stop recognition
    return () => {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    };
  } catch (err) {
    console.error('Error initializing speech recognition:', err);
    onEnd();
    return () => {};
  }
};

// Enhanced text to speech utility for professional voice output
export const speakText = (text: string, onEnd?: () => void): void => {
  // Check if browser supports speech synthesis
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error('Speech synthesis not supported in this browser environment');
    if (onEnd) onEnd();
    return;
  }
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Format text for better speech patterns
    // Replace common ERP abbreviations with full terms for better pronunciation
    const formattedText = text
      .replace(/ERP/g, 'E R P')
      .replace(/API/g, 'A P I')
      .replace(/UI/g, 'U I')
      .replace(/CSV/g, 'C S V')
      .replace(/PDF/g, 'P D F')
      .replace(/SFTP/g, 'S F T P')
      .replace(/IDMS/g, 'I D M S')
      // Add pauses at logical points
      .replace(/\.\s/g, '. ')
      .replace(/\:\s/g, ': ')
      .replace(/\n\n/g, ' ');
    
    const utterance = new SpeechSynthesisUtterance(formattedText);
    
    // Professional voice settings
    utterance.rate = 0.95;     // Slightly slower for clarity
    utterance.pitch = 1.05;    // Slightly higher pitch for authority
    utterance.volume = 1;      // Full volume
    
    // Get available voices and use a professional sounding one
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      // Voices might not be loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoice();
      };
    } else {
      setVoice();
    }
    
    function setVoice() {
      // Prioritize high-quality voices
      const preferenceOrder = [
        // Premium sounding voices - Microsoft/Google/Amazon
        { contains: ['Daniel', 'Google UK English Male', 'Microsoft Richard'], locale: 'en-GB' },
        { contains: ['Samantha', 'Google US English', 'Microsoft Zira'], locale: 'en-US' },
        // Fallbacks
        { contains: ['Male'], locale: 'en' },
        { contains: ['Female'], locale: 'en' }
      ];
      
      // Find the best available voice based on preference order
      let selectedVoice = null;
      for (const preference of preferenceOrder) {
        if (selectedVoice) break;
        
        // Try to find by name first
        for (const nameFragment of preference.contains) {
          const voice = voices.find(v => 
            v.name.includes(nameFragment) && 
            v.lang.startsWith(preference.locale)
          );
          if (voice) {
            selectedVoice = voice;
            break;
          }
        }
        
        // If no match by name, try just by locale
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith(preference.locale));
        }
      }
      
      // Set the selected voice or default to the first available
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Error with speech synthesis:', err);
    if (onEnd) onEnd();
  }
}; 