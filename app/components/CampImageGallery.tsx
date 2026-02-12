"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. Importiamo createPortal
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type Props = {
  campName: string;
  thumbnailSrc: string;
  galleryImages: string[];
};

export default function CampImageGallery({ campName, thumbnailSrc, galleryImages }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false); // Serve per evitare errori SSR

  // Se non ci sono immagini extra, usa la thumbnail come unica immagine
  const images = galleryImages.length > 0 ? galleryImages : [thumbnailSrc];

  // Necessario per usare document.body senza errori in Next.js (Server Side Rendering)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blocca lo scroll della pagina quando il modale è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    setCurrentIndex(0);
  };

  const closeModal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(false);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Il contenuto del modale estratto in una variabile per pulizia
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeModal}
    >
      {/* Pulsante Chiudi */}
      <button 
        onClick={closeModal}
        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50 backdrop-blur-sm"
      >
        <X size={32} />
      </button>

      {/* Container Immagine */}
      <div 
        className="relative w-full max-w-6xl h-full max-h-screen flex flex-col items-center justify-center p-4 md:p-10"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Immagine Principale */}
        <div className="relative shadow-2xl rounded-lg overflow-hidden">
           <img
            src={images[currentIndex]}
            alt={`${campName} - ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain mx-auto rounded-md"
          />
        </div>

        {/* Navigazione (solo se più di 1 immagine) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 hover:bg-black/60 p-3 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={40} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 hover:bg-black/60 p-3 rounded-full transition-all backdrop-blur-sm"
            >
              <ChevronRight size={40} />
            </button>

            {/* Pallini indicatori */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 p-2 rounded-full bg-black/20 backdrop-blur-sm">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all ${idx === currentIndex ? "bg-white scale-125 shadow-glow" : "bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Caption */}
        <div className="absolute top-6 left-6 md:left-10 text-white font-bold text-xl drop-shadow-md">
           {campName} <span className="text-sm font-normal opacity-80 ml-2">({currentIndex + 1} / {images.length})</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- MINIATURA NELLA CARD (Rimane al suo posto) --- */}
      <div 
        className="relative h-64 overflow-hidden cursor-pointer group"
        onClick={openModal}
      >
        <img
          src={thumbnailSrc}
          alt={campName}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 p-3 rounded-full shadow-lg text-blue-deep">
            <ZoomIn size={24} />
          </div>
        </div>
      </div>

      {/* --- MODALE CON PORTAL (Viene spostato nel BODY) --- */}
      {/* Renderizziamo il modale solo se è aperto e siamo lato client */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}