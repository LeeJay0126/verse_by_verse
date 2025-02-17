import "./Header.css";
import Logo from "./Logo";
import MenuOptions from "./MenuOptions";

const Header = () => {

    return (
        <header className="Header">
            <Logo />
            <MenuOptions/>
        </header>
    );
};

export default Header;