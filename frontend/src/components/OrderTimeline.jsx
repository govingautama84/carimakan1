import { motion } from 'framer-motion';

const OrderTimeline = ({ currentStatus }) => {
  const steps = [
    { key: 'CREATED', label: 'Pesanan Dibuat', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { key: 'VERIFIED', label: 'Pembayaran Valid', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'ACCEPTED', label: 'Diterima Restoran', icon: 'M5 13l4 4L19 7' },
    { key: 'PREPARING', label: 'Disiapkan', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'READY', label: 'Siap Diambil/Dikirim', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { key: 'DELIVERING', label: 'Dalam Perjalanan', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { key: 'COMPLETED', label: 'Selesai', icon: 'M5 13l4 4L19 7' }
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="py-8 px-2 max-w-3xl mx-auto">
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full hidden md:block"></div>
        
        {/* Active Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full transition-all duration-700 hidden md:block"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        ></div>

        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            
            return (
              <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 group">
                {/* Mobile vertical line */}
                <div className="md:hidden absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-200">
                   {isCompleted && <div className="w-full h-full bg-orange-500"></div>}
                </div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 relative z-10 ${
                    isCompleted 
                      ? 'bg-orange-500 border-white text-white shadow-lg shadow-orange-200' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} />
                  </svg>
                  
                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-full border-2 border-orange-500 animate-ping opacity-75"></span>
                  )}
                </motion.div>
                
                <div className="md:text-center md:w-24">
                  <span className={`text-sm font-semibold transition-colors duration-300 ${
                    isCurrent ? 'text-orange-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
