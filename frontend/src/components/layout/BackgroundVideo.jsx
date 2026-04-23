import { motion } from 'framer-motion';

export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#FAF7F2]">
      {/* Cartoon Office Background Illustration */}
      <motion.div
        animate={{
          scale: [1.1, 1.15, 1.1],
          x: ['-2%', '2%', '-2%'],
          y: ['-2%', '2%', '-2%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 z-0 opacity-40 brightness-[1.02]"
        style={{
          backgroundImage: 'url("/assets/images/office-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(0.5px)' 
        }}
      />

      {/* Subtle Mesh Grid Overlay */}
      <motion.div 
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ 
          backgroundImage: `radial-gradient(#C06C84 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Premium Gradient Overlays for Depth and Focus */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#FAF7F2]/20 to-[#FAF7F2]/80 z-20" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/10 via-transparent to-[#FAF7F2]/40 z-21" />

      {/* Soft Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(250,247,242,0.5)] z-22" />
    </div>
  );
}
