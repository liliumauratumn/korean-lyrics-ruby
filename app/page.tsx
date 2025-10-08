// ファイルパス: app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, Trash2, Clipboard } from 'lucide-react';
import { getAllLyrics, saveLyric, deleteLyric, migrateFromLocalStorage, SavedLyric, ConvertedChar } from '@/lib/indexedDB';

// ハングル分解用の定数
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const CHOSUNG_KATAKANA: { [key: string]: string } = {
  'ㄱ': 'k', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 't', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'ch', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
};

const JUNGSUNG_KATAKANA: { [key: string]: string } = {
  'ㅏ': 'a', 'ㅐ': 'e', 'ㅑ': 'ya', 'ㅒ': 'ye', 'ㅓ': 'eo',
  'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
  'ㅙ': 'we', 'ㅚ': 'we', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
  'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
};

const JONGSUNG_KATAKANA: { [key: string]: string } = {
  '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n',
  'ㄵ': 'n', 'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'r', 'ㄺ': 'k',
  'ㄻ': 'm', 'ㄼ': 'r', 'ㄽ': 'r', 'ㄾ': 'r', 'ㄿ': 'p',
  'ㅀ': 'r', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't',
  'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k',
  'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't'
};

const TENSIFICATION_INITIALS = ['ㄱ', 'ㄷ', 'ㅂ', 'ㅅ', 'ㅈ'];
const TENSIFICATION_MAP: { [key: string]: string } = {
  'ㄱ': 'ㄲ', 'ㄷ': 'ㄸ', 'ㅂ': 'ㅃ', 'ㅅ': 'ㅆ', 'ㅈ': 'ㅉ'
};

const ASPIRATION_MAP: { [key: string]: string } = {
  'ㄱㅎ': 'ㅋ', 'ㄷㅎ': 'ㅌ', 'ㅂㅎ': 'ㅍ', 'ㅈㅎ': 'ㅊ',
  'ㅎㄱ': 'ㅋ', 'ㅎㄷ': 'ㅌ', 'ㅎㅂ': 'ㅍ', 'ㅎㅈ': 'ㅊ'
};

const DOUBLE_JONGSUNG_LIAISON: { [key: string]: string } = {
  'ㄳ': 'ㄱ', 'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ', 'ㄺ': 'ㄱ', 'ㄻ': 'ㅁ',
  'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ', 'ㄾ': 'ㄹ', 'ㄿ': 'ㅂ', 'ㅀ': 'ㄹ', 'ㅄ': 'ㅂ'
};

const CONSONANT_TO_KANA: { [key: string]: string[] } = {
  '': ['', 'ア', 'イ', 'ウ', 'エ', 'オ'],
  'k': ['k', 'カ', 'キ', 'ク', 'ケ', 'コ'],
  'kk': ['kk', 'ッカ', 'ッキ', 'ック', 'ッケ', 'ッコ'],
  'n': ['n', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  't': ['t', 'タ', 'チ', 'トゥ', 'テ', 'ト'],
  'tt': ['tt', 'ッタ', 'ッチ', 'ットゥ', 'ッテ', 'ット'],
  'r': ['r', 'ラ', 'リ', 'ル', 'レ', 'ロ'],
  'm': ['m', 'マ', 'ミ', 'ム', 'メ', 'モ'],
  'p': ['p', 'パ', 'ピ', 'プ', 'ペ', 'ポ'],
  'pp': ['pp', 'ッパ', 'ッピ', 'ップ', 'ッペ', 'ッポ'],
  's': ['s', 'サ', 'シ', 'ス', 'セ', 'ソ'],
  'ss': ['ss', 'ッサ', 'ッシ', 'ッス', 'ッセ', 'ッソ'],
  'ch': ['ch', 'チャ', 'チ', 'チュ', 'チェ', 'チョ'],
  'jj': ['jj', 'ッチャ', 'ッチ', 'ッチュ', 'ッチェ', 'ッチョ'],
  'h': ['h', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ']
};

const VOWEL_TO_INDEX: { [key: string]: number } = {
  'a': 1, 'ya': 1, 'i': 2, 'u': 3, 'yu': 3, 'e': 4, 'ye': 4,
  'o': 5, 'yo': 5, 'eo': 5, 'eu': 3, 'ae': 4,
  'oe': 4, 'we': 4, 'wi': 2, 'wa': 1, 'wo': 5, 'ui': 2, 'yeo': 5
};

const SPECIAL_COMBINATIONS: { [key: string]: string } = {
  'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ', 'nye': 'ニェ',
  'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ', 'rye': 'リェ',
  'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ', 'mye': 'ミェ',
  'pya': 'ピャ', 'pyu': 'ピュ', 'pyo': 'ピョ', 'pye': 'ピェ',
  'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ', 'hye': 'ヒェ',
  'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ', 'kye': 'キェ',
  'kyeo': 'キョ', 'kkyeo': 'ッキョ',
  'nyeo': 'ニョ',
  'tyeo': 'チョ', 'ttyeo': 'ッチョ',
  'ryeo': 'リョ',
  'myeo': 'ミョ',
  'pyeo': 'ピョ', 'ppyeo': 'ッピョ',
  'syeo': 'ショ', 'ssyeo': 'ッショ',
  'chyeo': 'チョ', 'jjyeo': 'ッチョ',
  'hyeo': 'ヒョ',
  'pwa': 'ポァ', 'kwa': 'クァ', 'twa': 'トァ',
  'wa': 'ワ', 'wo': 'ウォ', 'we': 'ウェ', 'wi': 'ウィ',
  'yeo': 'ヨ', 'ye': 'イェ', 'ya': 'ヤ', 'yo': 'ヨ', 'yu': 'ユ',
  'ng': 'ン', 'n': 'ン', 'r': 'ル', 'm': 'ム', 'k': 'ク', 't': 'ッ', 'p': 'プ'
};

const VOICED_KANA: { [key: string]: string } = {
  'カ': 'ガ', 'キ': 'ギ', 'ク': 'グ', 'ケ': 'ゲ', 'コ': 'ゴ',
  'タ': 'ダ', 'チ': 'ジ', 'ツ': 'ヅ', 'トゥ': 'ドゥ', 'テ': 'デ', 'ト': 'ド',
  'パ': 'バ', 'ピ': 'ビ', 'プ': 'ブ', 'ペ': 'ベ', 'ポ': 'ボ',
  'チャ': 'ジャ', 'チュ': 'ジュ', 'チョ': 'ジョ', 'チェ': 'ジェ',
  'ポァ': 'ボァ', 'クァ': 'グァ', 'トァ': 'ドァ',
  'キョ': 'ギョ', 'ショ': 'ジョ', 'ヒョ': 'ビョ'
};

interface ConvertedChar {
  original: string;
  ruby?: string;
  mainSound?: string;
  batchimSound?: string;
  hasBatchim?: boolean;
  highlighted?: boolean;
  isNewline?: boolean;
  isSpace?: boolean;
  isCustomEdited?: boolean;
  decomposed?: {
    cho: string;
    jung: string;
    jong: string;
  };
  cho?: string;
  jung?: string;
  jong?: string;
}

interface SavedLyric {
  id: number;
  title: string;
  input: string;
  converted: ConvertedChar[];
  date: string;
}

function decomposeHangul(char: string) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  
  return {
    cho: CHOSUNG[cho],
    jung: JUNGSUNG[jung],
    jong: JONGSUNG[jong]
  };
}

function romanToKatakana(roman: string): string {
  if (!roman) return '';
  
  if (SPECIAL_COMBINATIONS[roman]) {
    return SPECIAL_COMBINATIONS[roman];
  }
  
  const consonants = ['kkyeo', 'ttyeo', 'ppyeo', 'ssyeo', 'jjyeo', 'kyeo', 'nyeo', 'tyeo', 'ryeo', 'myeo', 'pyeo', 'syeo', 'chyeo', 'hyeo', 'kk', 'tt', 'pp', 'ss', 'jj', 'ch', 'k', 't', 'r', 'p', 's', 'n', 'm', 'h', ''];
  
  for (const consonant of consonants) {
    if (roman.startsWith(consonant)) {
      const remainingVowel = roman.substring(consonant.length);
      const vowelIndex = VOWEL_TO_INDEX[remainingVowel];
      
      if (vowelIndex !== undefined && CONSONANT_TO_KANA[consonant]) {
        return CONSONANT_TO_KANA[consonant][vowelIndex];
      }
    }
  }
  
  return roman;
}

function applyVoicing(kana: string): string {
  let result = '';
  let i = 0;
  while (i < kana.length) {
    if (i + 1 < kana.length) {
      const twoChar = kana[i] + kana[i + 1];
      if (VOICED_KANA[twoChar]) {
        result += VOICED_KANA[twoChar];
        i += 2;
        continue;
      }
    }
    const oneChar = kana[i];
    result += VOICED_KANA[oneChar] || oneChar;
    i++;
  }
  return result;
}

function applyPronunciationRules(chars: ConvertedChar[]): ConvertedChar[] {
  const syllables = chars.map(char => {
    if (char.decomposed) {
      return {
        ...char,
        cho: char.decomposed.cho,
        jung: char.decomposed.jung,
        jong: char.decomposed.jong
      };
    }
    return char;
  });
  
  for (let i = 0; i < syllables.length; i++) {
    const current = syllables[i];
    
    if (!current.cho) continue;
    
    if (current.cho === 'ㄴ' && current.jung === 'ㅔ' && !current.jong) {
      let nextChar = null;
      for (let j = i + 1; j < syllables.length; j++) {
        if (syllables[j].cho) {
          nextChar = syllables[j];
          break;
        }
      }
      if (nextChar && nextChar.cho === 'ㄱ' && nextChar.jung === 'ㅏ') {
        current.jung = 'ㅣ';
      }
    }
    
    let nextStrict = null;
    for (let j = i + 1; j < syllables.length; j++) {
      if (syllables[j].isSpace || syllables[j].isNewline) break;
      if (syllables[j].cho) {
        nextStrict = syllables[j];
        break;
      }
    }
    
    let nextAcrossAll = null;
    for (let j = i + 1; j < syllables.length; j++) {
      if (syllables[j].cho) {
        nextAcrossAll = syllables[j];
        break;
      }
    }
    
    if (['ㄴ', 'ㅁ', 'ㅇ', 'ㄹ'].includes(current.jong || '') && nextAcrossAll && nextAcrossAll.cho === 'ㅎ') {
      nextAcrossAll.cho = current.jong || '';
      current.jong = '';
    }
    
    else if (nextStrict) {
      const next = nextStrict;
      
      if (['ㄷ', 'ㅌ'].includes(current.jong || '') && next.jung === 'ㅣ') {
        if (current.jong === 'ㄷ') next.cho = 'ㅈ';
        if (current.jong === 'ㅌ') next.cho = 'ㅊ';
        current.jong = '';
      }
      
      else if (['ㄴ', 'ㅁ', 'ㅇ'].includes(current.jong || '') && 
                next.cho === 'ㅇ' && 
                ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'].includes(next.jung || '')) {
        next.cho = 'ㄴ';
      }
      
      else if (current.jong === 'ㅎ' && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(next.cho || '')) {
        next.cho = ASPIRATION_MAP[current.jong + next.cho];
        current.jong = '';
      }
      else if (['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(current.jong || '') && next.cho === 'ㅎ') {
        next.cho = ASPIRATION_MAP[current.jong + next.cho];
        current.jong = '';
      }
      
      else if (current.jong === 'ㅎ' && next.cho === 'ㅇ') {
        current.jong = '';
      }
      
      else if (current.jong && current.jong !== '' && next.cho === 'ㅇ') {
        const liaisonConsonant = DOUBLE_JONGSUNG_LIAISON[current.jong] || current.jong;
        next.cho = liaisonConsonant;
        current.jong = '';
      }
      
      else if (['ㄱ', 'ㄷ', 'ㅂ', 'ㄲ', 'ㅆ'].includes(current.jong || '') && TENSIFICATION_INITIALS.includes(next.cho || '')) {
        if (next.cho && TENSIFICATION_MAP[next.cho]) {
          next.cho = TENSIFICATION_MAP[next.cho];
        }
      }
      
      else if (['ㄱ', 'ㄷ', 'ㅂ'].includes(current.jong || '') && ['ㄴ', 'ㅁ'].includes(next.cho || '')) {
        const nasalizationMap: { [key: string]: string } = {
          'ㄱ': 'ㅇ',
          'ㄷ': 'ㄴ',
          'ㅂ': 'ㅁ'
        };
        current.jong = nasalizationMap[current.jong || ''];
      }
      
      else if (['ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ'].includes(current.jong || '') && ['ㄴ', 'ㅁ'].includes(next.cho || '')) {
        current.jong = 'ㄴ';
      }
      
      else if (current.jong === 'ㄹ' && ['ㄴ', 'ㅁ'].includes(next.cho || '')) {
        current.jong = next.cho;
      }
    }
  }
  
  const result: ConvertedChar[] = [];
  for (let i = 0; i < syllables.length; i++) {
    const current = syllables[i];
    
    const prevElement = i > 0 ? syllables[i - 1] : null;
    
    let prevHangul = null;
    for (let j = i - 1; j >= 0; j--) {
      if (syllables[j].isNewline) break;
      if (syllables[j].cho) {
        prevHangul = syllables[j];
        break;
      }
    }
    
    if (!current.cho) {
      result.push(current);
      continue;
    }
    
    const cho = current.cho;
    const jung = current.jung;
    const jong = current.jong;
    const hasBatchim = jong && jong !== '';
    
    let shouldVoice = false;
    
    if (!prevElement || prevElement.isNewline) {
      shouldVoice = false;
    }
    else if (prevElement.isSpace) {
      if (prevHangul && prevHangul.cho) {
        const prevJong = prevHangul.jong;
        if (!prevJong || prevJong === '' || ['ㄴ', 'ㅁ', 'ㅇ', 'ㄹ'].includes(prevJong)) {
          shouldVoice = true;
        }
      }
    }
    else if (prevHangul && prevHangul.cho) {
      const prevJong = prevHangul.jong;
      if (!prevJong || prevJong === '' || ['ㄴ', 'ㅁ', 'ㅇ', 'ㄹ'].includes(prevJong)) {
        shouldVoice = true;
      }
    }
    
    const choJungRoman = (CHOSUNG_KATAKANA[cho] || '') + (JUNGSUNG_KATAKANA[jung || ''] || '');
    const jongRoman = jong ? (JONGSUNG_KATAKANA[jong] || '') : '';
    
    let mainSound = romanToKatakana(choJungRoman) || choJungRoman;
    const batchimSound = jongRoman ? (romanToKatakana(jongRoman) || jongRoman) : '';
    
    if (shouldVoice && ['ㄱ', 'ㄷ', 'ㅂ', 'ㅈ'].includes(cho)) {
      mainSound = applyVoicing(mainSound);
    }
    
    result.push({
      original: current.original,
      ruby: mainSound + batchimSound,
      mainSound: mainSound,
      batchimSound: batchimSound,
      hasBatchim: Boolean(hasBatchim && batchimSound),
      highlighted: false,
      decomposed: { cho, jung: jung || '', jong: jong || '' }
    });
  }
  
  return result;
}

function convertToKatakana(text: string): ConvertedChar[] {
  const chars: ConvertedChar[] = [];
  
  for (const char of text) {
    if (char.match(/[가-힣]/)) {
      const decomposed = decomposeHangul(char);
      if (decomposed) {
        chars.push({ original: char, decomposed });
      }
    } else if (char === '\n') {
      chars.push({ original: '\n', ruby: '', highlighted: false, isNewline: true });
    } else if (char.match(/\s/)) {
      chars.push({ original: char, ruby: '', highlighted: false, isSpace: true });
    } else {
      chars.push({ original: char, ruby: '', highlighted: false });
    }
  }
  
  return applyPronunciationRules(chars);
}

function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

export default function KoreanLyricsRuby() {
  const [input, setInput] = useState('');
  const [converted, setConverted] = useState<ConvertedChar[]>([]);
  const [useHiragana, setUseHiragana] = useState(false);
  const [useBatchimRomaji, setUseBatchimRomaji] = useState(false);
  const [highlightRieul, setHighlightRieul] = useState(true);
  const [highlightEu, setHighlightEu] = useState(true);
  const [savedLyrics, setSavedLyrics] = useState<SavedLyric[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMain, setEditMain] = useState('');
  const [editBatchim, setEditBatchim] = useState('');
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [showScrollTop, setShowScrollTop] = useState(false);
useEffect(() => {
  // LocalStorageからIndexedDBへの移行
  migrateFromLocalStorage().then(() => {
    // IndexedDBから全データ読み込み
    getAllLyrics().then((lyrics) => {
      setSavedLyrics(lyrics);
    }).catch((error) => {
      console.error('データ読み込みエラー:', error);
    });
  });
}, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrolled / windowHeight) * 100;
      
      setShowScrollTop(scrollPercentage > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConvert = () => {
    const result = convertToKatakana(input);
    setConverted(result);
  };

  const handleSave = async () => {
  const title = prompt('タイトルを入力してください（例：Spring Day - BTS）');
  if (!title || !title.trim()) {
    return;
  }
  
  const newLyric = {
    id: Date.now(),
    title: title.trim(),
    input: input,
    converted: converted,
    date: new Date().toISOString()
  };
  
  try {
    await saveLyric(newLyric);
    const updated = [...savedLyrics, newLyric];
    setSavedLyrics(updated);
    alert('保存しました！');
  } catch (error) {
    console.error('保存エラー:', error);
    alert('保存に失敗しました');
  }
};

  const handleLoad = (lyric: SavedLyric) => {
    setInput(lyric.input);
    setConverted(lyric.converted);
  };

const handleDelete = async (id: number) => {
  if (confirm('削除しますか？')) {
    try {
      await deleteLyric(id);
      const updated = savedLyrics.filter(l => l.id !== id);
      setSavedLyrics(updated);
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  }
};

  const handleExportSingle = (lyric: SavedLyric) => {
    const safeTitle = lyric.title.replace(/[/:*?"<>|]/g, '-');
    const dataStr = JSON.stringify([lyric], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.json`;
    link.click();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(savedLyrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'korean-lyrics-backup.json';
    link.click();
  };

const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
    const imported: SavedLyric[] = JSON.parse(event.target?.result as string);
const existingIds = new Set(savedLyrics.map(l => l.id));
const newLyrics = imported.filter((lyric) => !existingIds.has(lyric.id));

        if (newLyrics.length > 0) {
          // IndexedDBに保存
          for (const lyric of newLyrics) {
            await saveLyric(lyric);
          }
          
          const updated = [...savedLyrics, ...newLyrics];
          setSavedLyrics(updated);
        }
  } catch {
  alert('ファイルの読み込みに失敗しました');
}
    };
    reader.readAsText(file);
  }
};

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      alert('ペーストするには Ctrl+V (Mac: Cmd+V) を押してください');
    }
  };

  const handleMouseDown = (index: number) => {
    if (converted[index].isSpace || converted[index].isNewline) return;
    setIsDragging(true);
    const updated = [...converted];
    updated[index].highlighted = !updated[index].highlighted;
    setConverted(updated);
  };

  const handleMouseEnter = (index: number) => {
    if (!isDragging) return;
    if (converted[index].isSpace || converted[index].isNewline) return;
    const updated = [...converted];
    if (!updated[index].highlighted) {
      updated[index].highlighted = true;
      setConverted(updated);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const openEditModal = (index: number) => {
    if (converted[index].isSpace || converted[index].isNewline || !converted[index].ruby) return;
    setEditingIndex(index);
    setEditMain(converted[index].mainSound || '');
    setEditBatchim(converted[index].batchimSound || '');
    setEditModalOpen(true);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...converted];
    updated[editingIndex].mainSound = editMain;
    updated[editingIndex].batchimSound = editBatchim;
    updated[editingIndex].ruby = editMain + editBatchim;
    updated[editingIndex].isCustomEdited = true;
    setConverted(updated);
    setEditModalOpen(false);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditModalOpen(false);
    setEditingIndex(null);
  };

  const handleTouchStartEdit = (e: React.TouchEvent, index: number) => {
    if (converted[index].isSpace || converted[index].isNewline || !converted[index].ruby) return;
    
    const timer = setTimeout(() => {
      openEditModal(index);
    }, 500);
    
    setTouchTimer(timer);
  };

  const handleTouchEndEdit = (index: number) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
      
      const updated = [...converted];
      updated[index].highlighted = !updated[index].highlighted;
      setConverted(updated);
    }
  };

  const handleTouchMoveEdit = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const displayText = (char: ConvertedChar) => {
    const mainText = useHiragana && char.mainSound ? katakanaToHiragana(char.mainSound) : char.mainSound;
    let batchimText = char.batchimSound;
    
    if (useBatchimRomaji && char.decomposed && char.decomposed.jong) {
      batchimText = JONGSUNG_KATAKANA[char.decomposed.jong] || '';
    } else if (useHiragana && batchimText) {
      batchimText = katakanaToHiragana(batchimText);
    }
    
    return { mainText, batchimText };
  };

  const getBackgroundColor = (char: ConvertedChar) => {
    if (char.highlighted) return '#fef08a';
    
    if (highlightRieul && char.decomposed?.jong === 'ㄹ') {
      return 'linear-gradient(to bottom, transparent 50%, #bbf7d0 50%)';
    }
    
    return 'transparent';
  };

  const getBorderStyle = (char: ConvertedChar) => {
    if (highlightEu && char.decomposed?.jung === 'ㅡ') {
      return '2px solid #fb923c';
    }
    return 'none';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-800">
          韓国語歌詞ルビアプリ v10.3
        </h1>
        <p className="text-center text-gray-600 mb-2 text-sm">
          ハングルにカタカナ/ひらがなのルビを自動で付けます
        </p>
        <p className="text-center text-purple-600 mb-4 text-xs font-medium">
          📱 iPhone UI改善版
        </p>

     <div className="bg-white rounded-lg shadow-md sticky top-0 z-50 mb-4">
          {/* 設定ボタン */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              ⚙️ 設定
            </span>
            <span className="text-gray-500">
              {isSettingsOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* 設定パネル（開閉） */}
          {isSettingsOpen && (
            <div className="border-t p-4 space-y-4">
              {/* カタカナ/ひらがな */}
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useHiragana}
                    onChange={() => setUseHiragana(false)}
                    className="w-5 h-5"
                  />
                  <span className="text-base">カタカナ</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={useHiragana}
                    onChange={() => setUseHiragana(true)}
                    className="w-5 h-5"
                  />
                  <span className="text-base">ひらがな</span>
                </label>
              </div>
              
              {/* チェックボックス */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={useBatchimRomaji}
                    onChange={(e) => setUseBatchimRomaji(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-base">パッチムをローマ字表示</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={highlightRieul}
                    onChange={(e) => setHighlightRieul(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-base">リウルハイライト</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={highlightEu}
                    onChange={(e) => setHighlightEu(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-base">ㅡ(ウ)母音の枠線</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              ハングル歌詞を入力
            </label>
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              <Clipboard size={18} />
              ペースト
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="テスト用:&#10;면 → ミョン&#10;겼어 → キョッソ&#10;좋아 → チョア&#10;들 → ドゥル（リウルハイライト確認）"
            className="w-full h-40 p-3 border border-gray-300 rounded-md font-mono"
          />
          
          <button
            onClick={handleConvert}
            className="w-full mt-4 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-medium"
          >
            変換する
          </button>
        </div>

        {converted.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">変換結果</h2>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Save size={16} />
                保存
              </button>
            </div>
            
            <div 
              className="bg-gray-50 p-6 rounded-md overflow-auto" 
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="text-2xl" style={{ lineHeight: '3em' }}>
                {converted.map((char, index) => {
                  if (char.isNewline) {
                    return <br key={index} />;
                  }
                  const { mainText, batchimText } = displayText(char);
                  const isRieul = char.decomposed?.jong === 'ㄹ';
                  return (
                    <ruby
                      key={index}
                      className={`${!char.isSpace ? 'cursor-pointer' : ''}`}
                      onMouseDown={() => handleMouseDown(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onDoubleClick={() => openEditModal(index)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleTouchStartEdit(e, index);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleTouchEndEdit(index);
                      }}
                      onTouchMove={handleTouchMoveEdit}
                      style={{ 
                        marginRight: char.isSpace ? '0.5em' : char.hasBatchim ? '0.7em' : '0.3em',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        background: getBackgroundColor(char),
                        border: getBorderStyle(char),
                        padding: '2px 1px',
                        borderRadius: '4px'
                      }}>
                        {char.original}
                        {char.isCustomEdited && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            fontSize: '10px',
                            color: '#8b5cf6'
                          }}>✎</span>
                        )}
                      </span>
                      {char.ruby && (
                        <rt style={{ fontSize: '0.5em' }}>
                          <span>{mainText}</span>
                          {char.hasBatchim && (
                            <span style={{ 
                              fontSize: useBatchimRomaji ? '1em' : '0.7em',
                              opacity: useBatchimRomaji ? 1 : 0.7,
                              color: (highlightRieul && isRieul) ? '#22c55e' : 'inherit',
                              fontWeight: (highlightRieul && isRieul) ? 'bold' : 'normal'
                            }}>{batchimText}</span>
                          )}
                        </rt>
                      )}
                    </ruby>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-900 font-medium mb-2">💡 使い方のヒント</p>
              <div className="text-xs text-blue-800 space-y-1">
                <p>• 文字を<strong>クリック/タップ</strong>で黄色マーク、<strong>ドラッグ</strong>で複数選択</p>
                <p>• <strong>ダブルクリック/長押し</strong>で発音を自由に編集できます ✏️</p>
                <p>• <span className="inline-block px-2 py-0.5 mx-1" style={{background: 'linear-gradient(to bottom, transparent 50%, #bbf7d0 50%)'}}>緑の背景</span>＝パッチムㄹ（リウル）の発音</p>
                <p>• <span className="inline-block px-2 py-0.5 mx-1" style={{border: '2px solid #fb923c', borderRadius: '4px'}}>オレンジ枠</span>＝ㅡ(ウ)母音（口を横に開く😁特殊な発音）</p>
              </div>
            </div>
          </div>
        )}

        {editModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelEdit}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                ルビを編集
                {editingIndex !== null && (
                  <span className="ml-2 text-2xl">{converted[editingIndex].original}</span>
                )}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メイン音
                </label>
                <input
                  type="text"
                  value={editMain}
                  onChange={(e) => setEditMain(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="カタカナで入力"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パッチム音
                </label>
                <input
                  type="text"
                  value={editBatchim}
                  onChange={(e) => setEditBatchim(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="カタカナで入力（なければ空欄）"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">保存済み歌詞</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Download size={16} />
                エクスポート
              </button>
              <label className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm cursor-pointer">
                <Upload size={16} />
                インポート
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {savedLyrics.length === 0 ? (
            <p className="text-gray-500 text-center py-8">保存された歌詞はありません</p>
          ) : (
            <div className="space-y-2">
              {savedLyrics.map((lyric) => (
                <div key={lyric.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                  <div className="flex-1 cursor-pointer" onClick={() => handleLoad(lyric)}>
                    <h3 className="font-medium text-gray-800">{lyric.title}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(lyric.date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleExportSingle(lyric)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md" title="この曲をエクスポート">
                      <Download size={16} />
                    </button>
                    <button onClick={() => handleDelete(lyric.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

  {/* トップに戻るボタン */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 lg:right-[calc((100vw-56rem)/2-4rem)] bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 z-50 transition-opacity duration-300 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        title="トップに戻る"
      >
        ↑
      </button>
    </div>
  );
}