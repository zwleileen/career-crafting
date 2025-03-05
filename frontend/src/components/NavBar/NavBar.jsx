import { useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if the current path is sign-in or sign-up
  const isAuthPage = location.pathname === "/sign-in" || location.pathname === "/sign-up";

  return (
    <nav>
      {user ? (
        <ul>
          <li>Welcome, {user.username}</li>
          <li><Link to='/home'>Home</Link></li>
          <li><Link to='/values/results'>See values and strengths insights</Link></li>
          <li><Link to='/' onClick={handleSignOut}>Sign Out</Link></li>
        </ul>
      ) : (
        <ul>
          <li>
            <Link to="/">Career Crafting</Link>
          </li>
          {!isAuthPage && (
            <>
              <li>
                <Link to="/sign-in">Sign In</Link>
              </li>
              <li>
                <Link to="/sign-up">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
