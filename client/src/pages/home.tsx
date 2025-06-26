import { useEffect } from "react";
import { useLocation } from "wouter";

const Home = () => {
  const [, setLocation] = useLocation();

  // Redirect to admin login page when component mounts
  useEffect(() => {
    setLocation("/admin/login");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background">Redirecting to login...</div>
  );
};

export default Home;
