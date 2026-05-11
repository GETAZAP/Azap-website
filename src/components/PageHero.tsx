import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle: string;
  image?: string;
}

export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="pt-40 pb-20 px-6 overflow-hidden bg-background relative">
      <div className="container-tight !px-0 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-ink">{title}</h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-lg">{subtitle}</p>
        </motion.div>
        
        {image && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as any, delay: 0.15 }}
            className="rounded-3xl overflow-hidden shadow-lg border border-zinc-200/60 aspect-square bg-zinc-50"
          >
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
