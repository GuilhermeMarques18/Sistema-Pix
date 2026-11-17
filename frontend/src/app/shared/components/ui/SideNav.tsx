"use client";

import { House, ListBullets, Gear } from "@phosphor-icons/react";
import { useNavigate, useLocation } from "react-router-dom";
import { PixIcon } from "./PixIcon";

interface NavItem {
  label: string;
  icon: (active: boolean) => React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  {
    label: "Início",
    path: "/dashboard",
    icon: (active) => <House size={22} weight={active ? "fill" : "regular"} />,
  },
  {
    label: "Extrato",
    path: "/extrato",
    icon: (active) => (
      <ListBullets size={22} weight={active ? "fill" : "regular"} />
    ),
  },
  {
    label: "Chaves",
    path: "/keys",
    icon: (active) => <PixIcon size={22} className={active ? "opacity-100" : "opacity-50"} />,
  },
  {
    label: "Ajustes",
    path: "/ajustes",
    icon: (active) => <Gear size={22} weight={active ? "fill" : "regular"} />,
  },
];

export function SideNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/$/, "") || "/";

  return (
    <aside className="hidden md:flex flex-col w-72 min-h-screen border-r border-bg-input bg-bg shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-bg-input">
        <PixIcon size={28} />
        <span className="text-base font-bold text-text">Sistema Pix</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-brand-element/10 text-brand-element"
                    : "text-text-secondary hover:bg-bg-input hover:text-text"
                }`}
            >
              {item.icon(isActive)}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
