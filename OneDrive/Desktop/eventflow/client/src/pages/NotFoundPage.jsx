import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-bold text-primary-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
