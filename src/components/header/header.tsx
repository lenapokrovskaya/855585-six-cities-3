import Logo from '../logo/logo';
import { AuthorizationStatus } from '../../const';
import { logoutAction } from '../../store/api-actions';
import { useAppDispatch, useAppSelector } from '../../store';
import SignInLink from '../sign-in-link/sign-in-link';
import AuthorizedUserNav from '../authorized-user-nav/authorized-user-nav';


function Header(): JSX.Element {
  const dispatch = useAppDispatch();

  const authorizationStatus = useAppSelector((state) => state.authorizationStatus);
  const userEmail = useAppSelector((state) => state.email);

  const handleLogout = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    dispatch(logoutAction());
  };
  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          <div className="header__left">
            <Logo/>
          </div>
          <nav className="header__nav">
            <ul className="header__nav-list">
              {authorizationStatus === AuthorizationStatus.Auth ? (
                <AuthorizedUserNav onClick={handleLogout} userEmail={userEmail}/>
              ) : (
                <SignInLink/>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
