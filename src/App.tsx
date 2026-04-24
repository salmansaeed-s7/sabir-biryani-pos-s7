import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, History, Trash2, Printer, Plus, Minus, CheckCircle, Package, Clock, DollarSign, ChevronRight, Search, Info, Mail, MessageSquare, Instagram, Music2, Eye, X, FileDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem, Transaction } from './types';
import { MENU_ITEMS, CATEGORIES, POS_NAME, CURRENCY } from './constants';
import sabirLogo from './sabir_logo.png';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [view, setView] = useState<'pos' | 'history' | 'info'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [previewTransaction, setPreviewTransaction] = useState<Transaction | null>(null);
  const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle print state cleanup
  useEffect(() => {
    const handleAfterPrint = () => setPrintingTransaction(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pos_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: Transaction[]) => {
    localStorage.setItem('pos_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('pos_history');
    setShowDeleteConfirm(false);
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    // Create CSV header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Date,Time,Items,Total\n";

    // Add rows
    history.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      const time = new Date(tx.timestamp).toLocaleTimeString();
      const itemsList = tx.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
      csvContent += `${tx.id},${date},${time},"${itemsList}",${tx.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sabir_pos_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const nextQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: Date.now(),
      items: [...cart],
      total: total
    };

    const newHistory = [transaction, ...history];
    saveHistory(newHistory);
    setLastTransaction(transaction);
    setCart([]);
    setIsProcessing(false);
  };

  const handlePrint = (transaction: Transaction) => {
    setPrintingTransaction(transaction);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <>
      {/* Invisible Print Template */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: white !important;
          }
          #root > *:not(#receipt-print) {
            display: none !important;
          }
          #receipt-print {
            display: block !important;
            visibility: visible !important;
            width: 72mm !important;
            margin: 0 auto !important;
            padding: 4mm 2mm !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 11pt !important;
            line-height: 1.1 !important;
            color: black !important;
            background: white !important;
          }
          #receipt-print * {
            visibility: visible !important;
          }
          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .text-center { text-align: center !important; }
          .font-bold { font-weight: bold !important; }
          hr {
            border: none !important;
            border-top: 1px dashed black !important;
            margin: 2mm 0 !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Simple Receipt Template for Printing (Moved to top sibling for isolation) */}
      <div id="receipt-print" className="hidden print:block text-black bg-white">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-2 overflow-hidden rounded-full border border-black/10">
            <img src={sabirLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-bold uppercase tracking-wider mb-1">Sabir Biryani</p>
          <p className="text-xs">Location: Gulshan-e-Maymar</p>
          <p className="text-xs font-bold mt-1">WhatsApp: +92 345 0880202</p>
        </div>
        <hr className="border-t border-black border-dashed my-2" />
        <div className="flex justify-between text-xs mb-4">
           <span>Order: #{(printingTransaction || lastTransaction)?.id || 'TEST'}</span>
           <span>{new Date((printingTransaction || lastTransaction)?.timestamp || Date.now()).toLocaleDateString()}</span>
        </div>
        <div className="space-y-1 mb-4">
          {((printingTransaction || lastTransaction)?.items || []).map(item => (
            <div key={item.id} className="flex justify-between text-xs">
              <span>{item.quantity}x {item.name}</span>
              <span>{CURRENCY}{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <hr className="border-t border-black border-dashed my-2" />
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>{CURRENCY}{((printingTransaction || lastTransaction)?.total || 0).toFixed(2)}</span>
        </div>
        <div className="text-center mt-8 text-xs">
          <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
          <p className="mt-1 italic">Please visit again</p>
          <div className="mt-4 pt-4 border-t border-black border-dotted">
            <p className="text-[8px] opacity-50 uppercase tracking-widest">Powered by S7 Visuals</p>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-sleek-bg text-sleek-text-main font-sans selection:bg-amber-100 flex flex-col md:flex-row overflow-hidden no-print">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-[220px] bg-sleek-sidebar text-white flex flex-row md:flex-col py-6 z-50">
          <div className="px-6 pb-8 hidden md:flex items-center gap-3">
            <div className="w-3 h-3 bg-sleek-primary rounded-sm shadow-[0_0_8px_rgba(204,154,75,0.5)]"></div>
            <h1 className="text-xl font-bold tracking-tight">{POS_NAME}</h1>
          </div>
        
        <div className="flex flex-row md:flex-col flex-grow">
          <button 
            onClick={() => setView('pos')}
            className={`px-6 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 border-l-4 ${view === 'pos' ? 'bg-white/5 text-white border-sleek-primary' : 'text-[#94a3b8] border-transparent hover:text-white'}`}
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">Register</span>
          </button>
          
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 border-l-4 ${view === 'history' ? 'bg-white/5 text-white border-sleek-primary' : 'text-[#94a3b8] border-transparent hover:text-white'}`}
          >
            <History size={18} />
            <span className="hidden md:inline">Transaction History</span>
          </button>

          <button 
            onClick={() => setView('info')}
            className={`px-6 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 border-l-4 ${view === 'info' ? 'bg-white/5 text-white border-sleek-primary' : 'text-[#94a3b8] border-transparent hover:text-white'}`}
          >
            <Info size={18} />
            <span className="hidden md:inline">Info</span>
          </button>
        </div>

        <div className="mt-auto px-6 hidden md:block">
          <div className="pt-6 border-t border-white/10 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/s7_logo.png" 
                  alt="S7" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-white/50">Powered by <span className="text-[#21f6fd]">S7 Visuals</span></p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden no-print">
        {/* Header */}
        <header className="h-16 bg-white border-b border-sleek-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-sleek-border bg-slate-50 flex-shrink-0">
              <img 
                src={sabirLogo} 
                alt="Sabir Biryani Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="font-semibold text-lg">
              {view === 'pos' ? 'Sabir Biryani Checkout' : view === 'history' ? 'System History' : 'Business Information'}
            </h2>
          </div>
          
          <div className="flex gap-3">
            <div className="hidden sm:flex bg-[#f1f5f9] border border-sleek-border px-3 py-1 rounded-full text-[12px] text-sleek-text-muted font-medium items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sleek-primary"></div>
              System Online
            </div>
            <div className="flex bg-[#f1f5f9] border border-sleek-border px-3 py-1 rounded-full text-[12px] text-sleek-text-muted font-medium items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sleek-primary"></div>
              Printer Ready
            </div>
          </div>
        </header>

        {view === 'pos' ? (
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            {/* POS Inventory Section */}
            <div className="flex-grow flex flex-col bg-[#f1f5f9] overflow-hidden">
              <div className="p-6 bg-white border-b border-sleek-border">
                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none items-center">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 flex-shrink-0 flex items-center justify-center min-w-[140px] shadow-sm transform active:scale-95 ${
                        activeCategory === cat 
                        ? 'bg-sleek-primary text-white shadow-sleek-primary/30 ring-2 ring-sleek-primary/20' 
                        : 'bg-white text-sleek-text-muted border border-sleek-border hover:border-sleek-primary hover:text-sleek-primary hover:shadow-md'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(item)}
                      className="bg-white rounded-xl border border-sleek-border hover:border-sleek-primary transition-colors text-left flex flex-col group overflow-hidden shadow-sm h-full"
                    >
                      {item.image && (
                        <div className="w-full h-24 shrink-0 overflow-hidden bg-slate-100">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <span className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest">{item.category}</span>
                          <h3 className="font-semibold text-sm leading-tight mt-1 text-sleek-text-main group-hover:text-sleek-primary transition-colors">{item.name}</h3>
                        </div>
                        <p className="text-sleek-primary font-bold text-sm mt-2">{CURRENCY}{item.price.toFixed(2)}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Section */}
            <aside className="w-full md:w-[340px] bg-white border-l border-sleek-border flex flex-col shrink-0">
              <div className="p-5 border-b border-sleek-border flex items-center justify-between">
                <h2 className="font-bold text-base">Current Order</h2>
                <span className="text-[12px] font-bold text-sleek-primary">Terminal 01</span>
              </div>

              <div className="flex-grow overflow-y-auto p-5">
                <AnimatePresence initial={false}>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center py-12">
                       <ShoppingCart size={48} className="mb-4 opacity-10" />
                       <p className="text-xs font-bold uppercase tracking-widest">Basket is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex justify-between mb-5 items-start"
                      >
                        <div className="flex flex-col">
                          <strong className="text-sm font-semibold text-sleek-text-main">{item.name}</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] text-sleek-text-muted tracking-tight">x {item.quantity} @ {CURRENCY}{item.price.toFixed(2)}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 rounded bg-slate-100 text-slate-400 hover:text-black transition-colors"><Minus size={10} /></button>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 rounded bg-slate-100 text-slate-400 hover:text-black transition-colors"><Plus size={10} /></button>
                              <button onClick={() => removeFromCart(item.id)} className="p-0.5 rounded bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 ml-1 transition-colors" title="Remove Item"><Trash2 size={10} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-sm text-sleek-text-main shrink-0">
                          {CURRENCY}{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5 bg-sleek-bg border-t border-sleek-border">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-sleek-text-muted">
                    <span>Subtotal</span>
                    <span>{CURRENCY}{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-sleek-text-muted">
                    <span>Tax (0%)</span>
                    <span>{CURRENCY}0.00</span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold pt-3 border-t border-sleek-border border-dashed mt-3 text-sleek-text-main">
                    <span>Total</span>
                    <span>{CURRENCY}{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <button
                    disabled={cart.length === 0 || isProcessing}
                    onClick={handleCheckout}
                    className="w-full bg-sleek-primary text-white py-4 rounded-lg font-bold text-base shadow-lg shadow-amber-500/20 hover:brightness-95 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Process Payment'}
                  </button>
                  <button 
                    onClick={() => setCart([])}
                    className="w-full bg-white border border-sleek-border text-sleek-danger py-2.5 rounded-lg text-[13px] font-semibold hover:bg-red-50 transition-colors"
                  >
                    Clear Order Draft
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : view === 'history' ? (
          /* History View with Sleek Theme */
          <div className="flex-grow overflow-hidden flex flex-col bg-[#f1f5f9]">
            <div className="bg-white border-b border-sleek-border px-8 py-4 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-sleek-text-main uppercase tracking-[0.1em]">Transaction Archive</h3>
                <p className="text-[11px] text-sleek-text-muted">{history.length} records found in local storage</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={exportToCSV}
                  disabled={history.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-sleek-border rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold disabled:opacity-50"
                >
                  <FileDown size={14} className="text-sleek-primary" />
                  Export CSV
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={history.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-sleek-border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-xs font-bold text-sleek-danger disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-8 max-w-5xl mx-auto w-full">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 text-center">
                   <Package size={64} className="mb-4 opacity-5" />
                   <p className="text-sm font-bold uppercase tracking-widest leading-loose">No transactions recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map(tx => {
                    const isOld = Date.now() - new Date(tx.timestamp).getTime() > 3600000;
                    
                    if (isOld) {
                      return (
                        <div key={tx.id} className="bg-white/50 p-3 rounded-lg border border-sleek-border flex items-center justify-between shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-sleek-text-muted uppercase tracking-widest">MINIMIZED RECORD</span>
                              <p className="font-bold text-xs">#{tx.id}</p>
                            </div>
                            <div className="text-xs text-sleek-text-muted border-l border-sleek-border pl-6">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs font-bold text-sleek-primary border-l border-sleek-border pl-6">
                              {CURRENCY}{tx.total.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setPreviewTransaction(tx)}
                              className="p-2 bg-white border border-sleek-border rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-sleek-primary"
                              title="Preview Receipt"
                            >
                              <Eye size={12} />
                            </button>
                            <button 
                              onClick={() => handlePrint(tx)}
                              className="p-2 bg-white border border-sleek-border rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-sleek-primary"
                              title="Print Record"
                            >
                              <Printer size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={tx.id} className="bg-white p-6 rounded-xl border border-sleek-border flex flex-col md:flex-row gap-6 md:items-center shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-sleek-primary/20 group-hover:bg-sleek-primary transition-colors"></div>
                        <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-1">TX REF</p>
                            <p className="font-bold text-sm">#{tx.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-1">Time</p>
                            <p className="text-sm text-sleek-text-main">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-1">Volume</p>
                            <p className="font-bold text-sm">{tx.items.length} Items</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-1">Settled</p>
                            <p className="text-lg font-bold text-sleek-primary font-mono">{CURRENCY}{tx.total.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setPreviewTransaction(tx)}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-white border border-sleek-border rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold shrink-0"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                          <button 
                            onClick={() => handlePrint(tx)}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-sleek-primary text-white border border-sleek-primary rounded-lg hover:brightness-95 transition-all text-xs font-bold shrink-0 shadow-sm"
                          >
                            <Printer size={14} />
                            Print Record
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Info View */
          <div className="flex-grow overflow-hidden flex flex-col bg-[#f1f5f9]">
            <div className="flex-grow overflow-y-auto p-8 max-w-2xl mx-auto w-full">
              <div className="bg-white rounded-2xl border border-sleek-border shadow-sm overflow-hidden">
                <div className="p-8 border-b border-sleek-border bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-xl font-bold text-sleek-text-main">Contact & Social Media</h3>
                  <p className="text-sm text-sleek-text-muted mt-1">Connect with us on our official channels</p>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 p-4 rounded-xl border border-sleek-border hover:border-sleek-primary transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-0.5">WhatsApp</p>
                      <p className="font-bold text-lg text-sleek-text-main group-hover:text-sleek-primary transition-colors">+92 345 0880202</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 rounded-xl border border-sleek-border hover:border-sleek-primary transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                      <Instagram size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-0.5">Instagram</p>
                      <p className="font-bold text-lg text-sleek-text-main group-hover:text-sleek-primary transition-colors">@sabir.biryani.maymar</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 rounded-xl border border-sleek-border hover:border-sleek-primary transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Music2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-0.5">TikTok</p>
                      <p className="font-bold text-lg text-sleek-text-main group-hover:text-sleek-primary transition-colors">@sabir.biryani.maymar</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 rounded-xl border border-sleek-border hover:border-sleek-primary transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sleek-text-muted uppercase tracking-widest mb-0.5">Email Address</p>
                      <p className="font-bold text-lg text-sleek-text-main group-hover:text-sleek-primary transition-colors">sabirbiryanipakwan@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-sleek-border flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#21f6fd]/10 flex items-center justify-center text-[#21f6fd] z-10">
                      <span className="text-[8px] font-bold">S7</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-amber-600">
                      <span className="text-[8px] font-bold">POS</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-sleek-text-muted">S7-POS v1.2</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {lastTransaction && view === 'pos' && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-amber-50 text-sleek-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Complete</h2>
              <p className="text-gray-500 mb-8">Transaction <span className="font-mono font-bold text-black">#{lastTransaction.id}</span> was successful.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handlePrint(lastTransaction)}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                >
                  <Printer size={20} />
                  Print Receipt
                </button>
                <button 
                  onClick={() => setLastTransaction(null)}
                  className="w-full py-4 bg-gray-100 text-black rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Next Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTransaction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] overflow-hidden max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Receipt Preview</span>
                <button 
                  onClick={() => setPreviewTransaction(null)}
                  className="w-10 h-10 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-10 bg-gray-50 flex justify-center">
                <div className="bg-white p-8 w-[80mm] shadow-xl border border-gray-200">
                  {/* Receipt Content Mirror */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-2 overflow-hidden rounded-full border border-black/10">
                      <img src={sabirLogo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1">Sabir Biryani</p>
                    <p className="text-xs">Location: Gulshan-e-Maymar</p>
                    <p className="text-xs font-bold mt-1">WhatsApp: +92 345 0880202</p>
                  </div>
                  <hr className="border-t border-black border-dashed my-2" />
                  <div className="flex justify-between text-[10px] mb-4">
                     <span>#{previewTransaction.id}</span>
                     <span>{new Date(previewTransaction.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {previewTransaction.items.map(item => (
                      <div key={item.id} className="flex justify-between text-[10px]">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{CURRENCY}{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="border-t border-black border-dashed my-2" />
                  <div className="flex justify-between font-bold text-xs">
                    <span>TOTAL:</span>
                    <span>{CURRENCY}{previewTransaction.total.toFixed(2)}</span>
                  </div>
                  <div className="text-center mt-8 text-[10px]">
                    <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
                    <p className="mt-1 italic">Please visit again</p>
                    <div className="mt-4 pt-4 border-t border-black border-dotted">
                      <p className="text-[8px] opacity-50 uppercase tracking-widest">Powered by S7 Visuals</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                <button 
                  onClick={() => {
                    handlePrint(previewTransaction);
                    setPreviewTransaction(null);
                  }}
                  className="w-full py-4 bg-sleek-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-lg shadow-amber-200"
                >
                  <Printer size={20} />
                  Print Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-sleek-danger rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete All History?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                This action <span className="font-bold text-sleek-danger uppercase">cannot be undone</span>. All records will be permanently removed from your device.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={clearAllHistory}
                  className="w-full py-4 bg-sleek-danger text-white rounded-2xl font-bold hover:brightness-95 transition-all active:scale-95 shadow-lg shadow-red-100"
                >
                  Yes, Delete Everything
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-gray-100 text-black rounded-2xl font-bold hover:bg-gray-200 transition-all font-sans"
                >
                  No, Keep History
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
);
}
