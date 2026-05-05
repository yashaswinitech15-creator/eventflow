import { Link } from "react-router-dom";
import { Ticket, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Ticket size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">EventFlow</span>
            </Link>
            <p className="text-sm leading-relaxed">India's premier platform for discovering, creating, and booking unforgettable events.</p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Icon size={16} className="text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              {["Events", "Music", "Technology", "Sports", "Art", "Food"].map((item) => (
                <li key={item}><Link to={`/events?category=${item}`} className="hover:text-primary-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About Us", "Careers", "Blog", "Press", "Contact"].map((item) => (
                <li key={item}><a href="#" className="hover:text-primary-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              {["Help Center", "Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"].map((item) => (
                <li key={item}><a href="#" className="hover:text-primary-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} EventFlow. All rights reserved.</p>
          <p className="text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
