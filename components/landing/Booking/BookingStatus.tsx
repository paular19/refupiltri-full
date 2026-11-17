import React from "react";
import Link from "next/link";

// Pantalla a la que vuelve el cliente desde Mercado Pago (back_urls de la preferencia)

export const WHATSAPP_URL = "https://wa.me/5492944120310";

type Action = { label: string; href: string; external?: boolean };

const buttonClass =
  "inline-block bg-[#C0DAE0] text-[#6E6F30] py-3 px-6 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300";

export const BookingStatus = ({
  id,
  title,
  paragraphs,
  actions,
}: {
  id: string;
  title: string;
  paragraphs: string[];
  actions: Action[];
}) => (
  <div>
    <section id={id} className="py-20 bg-light-beige relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl shadow-xl p-8 text-center"
          style={{ backgroundColor: "#6E6F30" }}
        >
          <h2 className="text-3xl font-poppins font-semibold text-[#C0DAE0] mb-4">
            {title}
          </h2>
          {paragraphs.map((text) => (
            <p key={text} className="text-[#C0DAE0] font-poppins font-light mb-6">
              {text}
            </p>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action) =>
              action.external ? (
                <a
                  key={action.href}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass}
                >
                  {action.label}
                </a>
              ) : (
                <Link key={action.href} href={action.href} className={buttonClass}>
                  {action.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
);
