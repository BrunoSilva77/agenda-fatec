import React from 'react';
import { Clock, Phone } from 'lucide-react';

// Ícones de redes sociais (SVG inline — o lucide não traz marcas)
const IconeFacebook = () => (
  <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
  </svg>
);
const IconeInstagram = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IconeTikTok = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.86-2.48V9.77a5.77 5.77 0 1 0 4.04 5.5V9.01c1.15.83 2.55 1.33 4.05 1.38V7.3a4.28 4.28 0 0 1-2.08-1.48z" />
  </svg>
);

export function TopBar() {
  return (
    <div className="topbar">
      <div className="container">
        <ul>
          <li>Acompanhe nossas Redes:</li>
          <li>
            <a className="rede-facebook" href="https://www.facebook.com/fatecaracatuba/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <IconeFacebook />
            </a>
          </li>
          <li>
            <a className="rede-instagram" href="https://www.instagram.com/fatec177/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <IconeInstagram />
            </a>
          </li>
          <li>
            <a className="rede-tiktok" href="https://www.tiktok.com/@fatec177" target="_blank" rel="noreferrer" aria-label="TikTok">
              <IconeTikTok />
            </a>
          </li>
        </ul>
        <ul>
          <li><Clock size={13} /> Seg a Sex 7h30-11h30, 13h-17h</li>
          <li><Phone size={13} /> (18) 3625-9914</li>
        </ul>
      </div>
    </div>
  );
}
