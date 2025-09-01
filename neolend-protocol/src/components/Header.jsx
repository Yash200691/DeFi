import React from 'react';

const Header = ({ account, connectWallet }) => {
    return (
        <header className="app-header">
            <h1>DeFi Dashboard</h1>
            <button className="connect-wallet-btn" onClick={connectWallet}>
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
        </header>
    );
};

export default Header;