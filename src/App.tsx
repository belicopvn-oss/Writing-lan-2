import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  RotateCcw, 
  Trophy,
  XCircle,
  Filter,
  Sun,
  Moon,
  RefreshCw,
  Lightbulb,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { questions } from './data/questions';
import { Question, QuizMode } from './types';

export default function App() {
  const [view, setView] = useState<'home' | 'quiz' | 'results'>('home');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [aiExplanation, setAIExplanation] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [filterPart, setFilterPart] = useState<string>('All');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const filteredQuestions = useMemo(() => {
    if (filterPart === 'All') return questions;
    return questions.filter(q => q.part === filterPart);
  }, [filterPart]);

  const currentQuestion = filteredQuestions[currentIdx];

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };

  const handleNext = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowFeedback(false);
      setShowHint(false);
      setShowAIExplanation(false);
      setAIExplanation(null);
    } else {
      setView('results');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowFeedback(false);
      setShowHint(false);
      setShowAIExplanation(false);
      setAIExplanation(null);
    }
  };

  const handleRedo = () => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: '' }));
    setShowFeedback(false);
    setShowHint(false);
    setShowAIExplanation(false);
    setAIExplanation(null);
  };

  const checkAnswer = (user: string, correct: string) => {
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    return normalize(user) === normalize(correct);
  };

  const score = useMemo(() => {
    return filteredQuestions.reduce((acc, q) => {
      return acc + (checkAnswer(answers[q.id] || '', q.answer) ? 1 : 0);
    }, 0);
  }, [answers, filteredQuestions]);

  const startQuiz = (m: QuizMode) => {
    setMode(m);
    setCurrentIdx(0);
    setAnswers({});
    setShowFeedback(false);
    setShowHint(false);
    setShowAIExplanation(false);
    setAIExplanation(null);
    setView('quiz');
  };

  const parts = ['All', ...Array.from(new Set(questions.map(q => q.part)))];

  const AuthorTag = () => (
    <div className="text-center py-12 opacity-30 text-xs font-black tracking-[0.4em] uppercase">
      Tác giả: Thanh Tài
    </div>
  );

  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className="btn-icon"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={22} /> : <Sun size={22} className="text-yellow-400" />}
    </button>
  );

  if (view === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-500 overflow-y-auto">
        <div className="absolute top-8 right-8 z-50">
          <ThemeToggle />
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full text-center space-y-12 relative z-10 py-20"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] mb-4 shadow-2xl shadow-indigo-500/40 mx-auto">
            <GraduationCap size={48} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl font-serif italic font-bold tracking-tight">
              English <span className="text-gradient">Writing Practice</span>
            </h1>
            <p className="text-xl opacity-70 max-w-lg mx-auto leading-relaxed">
              Nâng tầm kỹ năng tiếng Anh với các bài tập biến đổi câu hiện đại và thông minh.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <button 
              onClick={() => startQuiz('practice')}
              className="btn-primary"
            >
              <BookOpen size={22} />
              Luyện tập ngay
            </button>
            <button 
              onClick={() => startQuiz('test')}
              className="btn-neutral"
            >
              <Trophy size={22} className="text-amber-500" />
              Kiểm tra trình độ
            </button>
          </div>

          <div className="pt-12 space-y-6">
            <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest opacity-40">
              <Filter size={16} />
              <span>Lọc theo học phần</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {parts.map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPart(p)}
                  className={`tab-btn ${
                    filterPart === p 
                      ? 'tab-btn-active' 
                      : 'tab-btn-inactive'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <AuthorTag />
        </motion.div>
      </div>
    );
  }

  if (view === 'results') {
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-500">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-card p-12 text-center space-y-8"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
            <Trophy size={56} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-serif italic font-bold">Hoàn thành!</h2>
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">
              {filterPart === 'All' ? 'Tất cả các phần' : `Kết quả ${filterPart}`}
            </p>
            <div className="py-4">
              <p className="text-7xl font-black text-gradient">{percentage}%</p>
              <p className="text-lg opacity-60 mt-2 font-medium">
                Bạn đã đúng {score}/{filteredQuestions.length} câu hỏi
              </p>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col gap-4">
            <button 
              onClick={() => setView('home')}
              className="btn-primary w-full"
            >
              Về trang chủ
            </button>
            <button 
              onClick={() => startQuiz(mode)}
              className="btn-neutral w-full"
            >
              <RotateCcw size={20} />
              Thử lại lần nữa
            </button>
          </div>
        </motion.div>
        <AuthorTag />
      </div>
    );
  }

  const fetchAIExplanation = async () => {
    if (aiExplanation) {
      setShowAIExplanation(true);
      return;
    }

    setIsGeneratingAI(true);
    setShowAIExplanation(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Bạn là một giáo viên tiếng Anh chuyên nghiệp. 
        Hãy giải thích cách làm câu bài tập biến đổi câu (Sentence Transformation) sau đây một cách ngắn gọn, dễ hiểu bằng tiếng Việt.
        
        Câu gốc: "${currentQuestion.original}"
        Từ khóa bắt buộc: "${currentQuestion.keyword}"
        Phần đầu câu gợi ý: "${currentQuestion.sentenceStart}"
        Phần cuối câu gợi ý: "${currentQuestion.sentenceEnd}"
        Đáp án đúng: "${currentQuestion.answer}"
        
        Yêu cầu giải thích:
        1. Cấu trúc ngữ pháp được sử dụng.
        2. Tại sao lại dùng cấu trúc đó trong ngữ cảnh này.
        3. Các bước để đi đến đáp án.
        
        Hãy trình bày dưới dạng các ý gạch đầu dòng ngắn gọn.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAIExplanation(response.text || "Không thể tạo hướng dẫn lúc này.");
    } catch (error) {
      console.error("AI Error:", error);
      setAIExplanation("Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const isCorrect = checkAnswer(answers[currentQuestion.id] || '', currentQuestion.answer);

  return (
    <div className="min-h-screen p-6 sm:p-12 transition-all duration-500">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('home')}
            className="btn-icon"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] font-black opacity-30 mb-1">{currentQuestion.part}</p>
            <h3 className="text-2xl font-serif italic font-bold">Câu {currentIdx + 1} <span className="opacity-30">/</span> {filteredQuestions.length}</h3>
          </div>
          
          <ThemeToggle />
        </div>

        {/* Progress Visualizer */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40 px-1">
            <span>Tiến độ</span>
            <span>{Math.round(((currentIdx + 1) / filteredQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </div>

        {/* Main Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="glass-card p-10 sm:p-16 space-y-12 relative overflow-hidden"
          >
            {/* Decorative Background for Card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                <BookOpen size={14} />
                <span>Câu gốc cần biến đổi</span>
              </div>
              <p className="text-2xl sm:text-3xl leading-relaxed font-semibold tracking-tight">
                "{currentQuestion.original}"
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black rounded-xl uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 flex items-center gap-2">
                  <Lightbulb size={14} />
                  Từ khóa: {currentQuestion.keyword}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowHint(true)}
                    className="px-6 py-2 btn-warning !rounded-xl !py-2 !px-6 text-xs uppercase tracking-[0.2em] font-black flex-1 sm:flex-none"
                  >
                    <Lightbulb size={14} />
                    Gợi ý
                  </button>
                  <button 
                    onClick={fetchAIExplanation}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white !rounded-xl !py-2 !px-6 text-xs uppercase tracking-[0.2em] font-black flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex-1 sm:flex-none"
                  >
                    {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Guide
                  </button>
                </div>
              </div>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center"
                >
                  <p className="text-sm font-medium opacity-60 italic">
                    Gợi ý: Bắt đầu bằng "<span className="font-bold text-amber-500">{currentQuestion.answer.split(' ')[0]}...</span>"
                  </p>
                </motion.div>
              )}
              {showAIExplanation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest">
                      <Sparkles size={14} />
                      <span>Hướng dẫn từ AI</span>
                    </div>
                    {isGeneratingAI ? (
                      <div className="flex items-center gap-3 text-sm opacity-60 italic">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Đang phân tích câu hỏi...</span>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed opacity-80 whitespace-pre-line">
                        {aiExplanation}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40">
                <RefreshCw size={14} />
                <span>Hoàn thành câu dưới đây</span>
              </div>
              
              <div className="space-y-8">
                <div className="text-xl sm:text-2xl leading-[2.5] flex flex-wrap items-center gap-x-3 gap-y-6 font-medium">
                  <span className="opacity-80">{currentQuestion.sentenceStart}</span>
                  <div className="relative flex-1 min-w-[280px]">
                    <input 
                      type="text"
                      autoFocus
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Nhập phần còn thiếu..."
                      className={`soft-input ${
                        showFeedback 
                          ? isCorrect ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'
                          : ''
                      }`}
                      disabled={showFeedback && mode === 'practice'}
                    />
                  </div>
                  <span className="opacity-80">{currentQuestion.sentenceEnd}</span>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="w-full z-20"
                    >
                      <div className={`p-5 rounded-3xl flex items-start gap-4 shadow-xl ${
                        isCorrect 
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
                      }`}>
                        <div className={`p-2 rounded-2xl ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-lg uppercase tracking-tight">
                            {isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm font-medium opacity-90 leading-relaxed">
                              Đáp án đúng là: <span className="font-bold underline decoration-2 underline-offset-4">{currentQuestion.answer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-16 flex flex-wrap items-center justify-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="btn-neutral"
              >
                <ChevronLeft size={22} />
                <span>Trước</span>
              </button>

              <button 
                onClick={handleRedo}
                className="btn-danger"
                title="Làm lại câu này"
              >
                <RefreshCw size={22} />
                <span>Làm lại</span>
              </button>
              
              {!showFeedback && (
                <button 
                  onClick={() => setShowFeedback(true)}
                  disabled={!answers[currentQuestion.id]}
                  className="btn-success"
                >
                  <Check size={22} />
                  Kiểm tra
                </button>
              )}
              
              <button 
                onClick={handleNext}
                className="btn-primary"
              >
                <span>{currentIdx === filteredQuestions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}</span>
                <ChevronRight size={22} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <AuthorTag />
      </div>
    </div>
  );
}
