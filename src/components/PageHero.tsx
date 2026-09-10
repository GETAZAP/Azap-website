import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle: string;
  image?: string;
}

/**
 * Entrance animation is CSS (`.rise` in global.css), not framer-motion.
 *
 * This previously used `initial={{ opacity: 0 }}`, which meant the heading and
 * subtitle of ten pages were server-rendered invisible and only appeared once
 * React hydrated. If JS is slow, blocked or errors, those pages rendered with no
 * headline at all. The CSS version animates towards a base state that is already
 * visible, so the worst case is an un-animated page rather than an empty one.
 */
export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="pt-28 md:pt-40 pb-20 px-6 overflow-hidden bg-background relative">
      <div className={`container-tight !px-0 ${image ? 'grid grid-cols-1 lg:grid-cols-2 gap-16 items-center' : 'flex flex-col items-center text-center'}`}>
        <div className={`rise ${!image ? 'flex flex-col items-center' : ''}`}>
          <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-ink ${!image ? 'max-w-3xl' : ''}`}>{title}</h1>
          <p className={`text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-lg ${!image ? 'mx-auto' : ''}`}>{subtitle}</p>
        </div>

        {image && (
          <div className="rise rise-2 rounded-3xl overflow-hidden shadow-lg border border-zinc-200/60 aspect-square bg-zinc-50">
            {/* alt="" deliberately. This is a decorative scene beside the
                heading, and alt={title} made a screen reader read every page
                title twice — once as the h1, once as a picture of itself. */}
            <img
              src={image}
              alt=""
              width="800"
              height="800"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
