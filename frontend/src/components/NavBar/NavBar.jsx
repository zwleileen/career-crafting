import { useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';

const NavBar = () => {
  const { user, setUser, valuesId, imagineId } = useContext(UserContext);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <nav className="w-full bg-[#EDECE4] py-12 px-4 relative">
        <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <h1 className="text-[#586E75] text-3xl md:text-4xl lg:text-5xl font-normal font-[Single_Day] text-center">
            Career Crafting App
          </h1>
        </div>
        { user ? (
        <>
        <div className="absolute left-4 md: bottom-3 flex items-center cursor-pointer space-x-2" >
            <Link 
            to="/home"
            className="text-[#586E75] text-sm font-normal font-[DM_Sans] ml-2 hover:text-[#f9a825]"
            >
            Home
            </Link>
            
            {user._id && (
            <Link 
            to={`/values/results/${valuesId}`}
            className="text-[#586E75] text-sm font-normal font-[DM_Sans] ml-2 hover:text-[#f9a825]"
            >
            Insights
            </Link>
            )}

            <Link 
            to={"/careerpath"}
            className="text-[#586E75] text-sm font-normal font-[DM_Sans] ml-2 hover:text-[#f9a825]"
            >
            Career Paths
            </Link>
        </div>

        <div className="absolute right-4 md:right-8 bottom-2 flex items-center cursor-pointer">
            <Link 
            to='/' 
            onClick={handleSignOut}
            className="text-[#586E75] text-sm font-normal font-[DM_Sans] mr-2 hover:text-[#f9a825]"            >
            Sign Out
            </Link>
            <span className="material-symbols-outlined">
                account_circle
            </span>
        </div>
        </>
        ) : (
        <>
        <div className="absolute right-4 md:right-8 bottom-2 flex items-center cursor-pointer">
            <Link 
            to='/sign-in' 
            className="text-[#586E75] text-sm font-normal font-[DM_Sans] mr-2 hover:text-[#f9a825]"
            >
            Sign In
            </Link>
            <span className="material-symbols-outlined">
                account_circle
            </span>
        </div>
        </>
        )}
        </div>
    </nav>
  );
};

export default NavBar;
