import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// You will also need the ABI for Account.sol
const accountAbi = [/* ABI from backend/artifacts/contracts/Account.sol/Account.json */];

const Account = ({ provider, signer, factoryAddress, factoryAbi }) => {
    const [factoryContract, setFactoryContract] = useState(null);
    const [userAccountAddress, setUserAccountAddress] = useState(null);
    const [userAccountContract, setUserAccountContract] = useState(null);
    const [balance, setBalance] = useState('0');
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (signer) {
            const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
            setFactoryContract(contract);
            checkExistingAccount();
        }
    }, [signer]);

    const checkExistingAccount = async () => {
        if (signer) {
            const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
            const address = await factory.userAccounts(signer.address);
            if (address !== ethers.ZeroAddress) {
                setUserAccountAddress(address);
                const accountContract = new ethers.Contract(address, accountAbi, signer);
                setUserAccountContract(accountContract);
                updateBalance(accountContract);
            }
        }
    };
    
    const updateBalance = async (contract) => {
        const bal = await contract.getBalance();
        setBalance(ethers.formatEther(bal));
    }

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        try {
            const tx = await factoryContract.createAccount(username);
            await tx.wait();
            alert("Account created successfully!");
            checkExistingAccount();
        } catch (error) {
            console.error("Error creating account:", error);
            alert("Failed to create account. See console for details.");
        }
    };

    // Placeholder functions for deposit, withdraw, transfer
    const handleDeposit = async (amount) => {
         // Implement deposit logic here
    };

    if (!userAccountAddress) {
        return (
            <div className="glass-card">
                <h2>Create Your Smart Account</h2>
                <form onSubmit={handleCreateAccount}>
                    <input 
                        type="text" 
                        placeholder="Choose a username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                    <button type="submit">Create Account</button>
                </form>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <h2>My Smart Account</h2>
            <p><strong>Address:</strong> {userAccountAddress}</p>
            <h3>Balance: {parseFloat(balance).toFixed(4)} ETH</h3>
            {/* Add forms for Deposit, Withdraw, Transfer here */}
        </div>
    );
};

export default Account;