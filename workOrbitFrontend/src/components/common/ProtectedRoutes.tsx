// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { Loader } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="glass-card p-8 text-center">
//           <Loader className="animate-spin mx-auto mb-4" size={32} />
//           <p className="text-gray-300">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;