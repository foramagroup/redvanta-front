// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50">
//       <div className="container flex items-center justify-between px-4 py-3">
        
//         <Link href="/" className="font-bold">
//           Krootal
//         </Link>

//         <div className="flex items-center gap-4">
//           <Link href="/dashboard" className="text-sm">
//             Admin
//           </Link>

//           <Link 
//             href="/checkout" 
//             className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
//           >
//             Checkout
//           </Link>
//         </div>

//       </div>
//     </nav>
//   );
// }
"use client";


import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Product", path: "/product" },
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Agency", path: "/agency" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  // const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          RED<span className="text-gradient-red">VANTA</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* <div className="hidden items-center gap-4 lg:flex">
          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
              Start Free Trial
            </Button>
          </Link>
        </div> */}

        <div className="flex items-center gap-3 lg:hidden">
          <Link to="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/50 bg-background lg:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-muted-foreground">Log In</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;