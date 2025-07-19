import React, { useState } from 'react';
import { Brain, User, LogOut, History, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../Auth/AuthModal';

interface HeaderProps {
  onShowHistory?: () => void;
  onShowFavorites?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowHistory, onShowFavorites }) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">商品比較AI</h1>
                <p className="text-xs text-gray-500">Powered by Gemini</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onShowHistory}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="比較履歴"
                  >
                    <History size={20} />
                  </button>
                  
                  <button
                    onClick={onShowFavorites}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="お気に入り"
                  >
                    <Heart size={20} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <User size={20} />
                      <span className="text-sm font-medium hidden sm:block">
                        {user?.email?.split('@')[0]}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-lg border border-gray-200 py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut size={16} />
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};