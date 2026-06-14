import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogIn } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWalletLogin = async () => {
    setIsWalletLoading(true);
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const message = `Login to LandVault at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(message);

      const response = await fetch('http://localhost:5000/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature, message })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success("Wallet connected!");
        
        const role = data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'registrar') navigate('/registrar');
        else navigate('/my-properties');
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    } finally {
      setIsWalletLoading(false);
    }
  };

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success("Login successful!");

        const role = data.user.role;
        if (role === 'admin') navigate('/admindashboard');
        else if (role === 'registrar') navigate('/registrardashboard');
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-zinc-950 flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-800">
          
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img 
                src="/DxEHk.jpg"           // Put your logo in public folder
                alt="LandVault Logo" 
                className="h-20 w-auto rounded-md"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">LandVault</h1>
            <p className="text-teal-500 text-sm mt-1">Secure Land Registry for Swazi Owned Land</p>
          </div>

          {/* Wallet Button */}
          <button
            onClick={handleWalletLogin}
            disabled={isWalletLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition mb-6 disabled:opacity-70"
          >
            <Wallet size={20} />
            {isWalletLoading ? "Connecting..." : "Connect Wallet"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-900 px-4 text-xs text-zinc-500">OR</span>
            </div>
          </div>

          {/* Staff Login Form */}
          <form onSubmit={handleTraditionalLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-teal-500 placeholder-zinc-500"
              placeholder="Email address"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-teal-500 placeholder-zinc-500"
              placeholder="Password"
            />

            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full bg-white text-zinc-900 font-semibold py-3.5 rounded-2xl hover:bg-zinc-100 transition disabled:opacity-70"
            >
              {isFormLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-8">
            Powered by Blockchain • Secure & Transparent
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;