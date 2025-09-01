import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Lending = ({ signer, lendingAddress, lendingAbi }) => {
    const [lendingContract, setLendingContract] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [repayAmount, setRepayAmount] = useState('');
    const [healthFactor, setHealthFactor] = useState('N/A');
    const [borrowBalance, setBorrowBalance] = useState('0');

    // Initialize contract instance and fetch user data
    useEffect(() => {
        if (signer) {
            const contract = new ethers.Contract(lendingAddress, lendingAbi, signer);
            setLendingContract(contract);
            updateUserData(contract);
        }
    }, [signer]);

    // Function to fetch and update user-specific data
    const updateUserData = async (contract) => {
        try {
            const userAddress = await signer.getAddress();
            const hf = await contract.getHealthFactor(userAddress);
            const debt = await contract.borrowBalances(userAddress);

            // Health Factor is returned as a large number (e.g., 1.5e18), so we format it
            setHealthFactor(ethers.formatEther(hf));
            setBorrowBalance(ethers.formatEther(debt));
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Handler for depositing ETH into the lending pool
    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!lendingContract || !depositAmount) return;
        try {
            const amountWei = ethers.parseEther(depositAmount);
            const tx = await lendingContract.depositInPool({ value: amountWei });
            await tx.wait();
            alert('Deposit successful!');
            setDepositAmount('');
            updateUserData(lendingContract); // Refresh user data after transaction
        } catch (error) {
            console.error("Error depositing ETH:", error);
            alert('Deposit failed. See console for details.');
        }
    };

    // Handler for borrowing ETH
    const handleBorrow = async (e) => {
        e.preventDefault();
        if (!lendingContract || !borrowAmount) return;
        try {
            const amountWei = ethers.parseEther(borrowAmount);
            const tx = await lendingContract.borrow(amountWei);
            await tx.wait();
            alert('Borrow successful!');
            setBorrowAmount('');
            updateUserData(lendingContract);
        } catch (error) {
            console.error("Error borrowing ETH:", error);
            alert('Borrow failed. See console for details.');
        }
    };

    // Handler for repaying a loan
    const handleRepay = async (e) => {
        e.preventDefault();
        if (!lendingContract || !repayAmount) return;
        try {
            const amountWei = ethers.parseEther(repayAmount);
            const tx = await lendingContract.repay({ value: amountWei });
            await tx.wait();
            alert('Repayment successful!');
            setRepayAmount('');
            updateUserData(lendingContract);
        } catch (error) {
            console.error("Error repaying loan:", error);
            alert('Repay failed. See console for details.');
        }
    };

    return (
        <div className="glass-card">
            <h2>DeFi Lending Protocol</h2>
            
            <div className="user-stats">
                <p><strong>Health Factor:</strong> {parseFloat(healthFactor).toFixed(2)}</p>
                <p><strong>Current Debt:</strong> {parseFloat(borrowBalance).toFixed(5)} ETH</p>
            </div>

            {/* Deposit Section */}
            <div className="action-section">
                <h3>Deposit ETH, Mint dETH</h3>
                <form onSubmit={handleDeposit}>
                    <input
                        type="text"
                        placeholder="0.1 ETH"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        required
                    />
                    <button type="submit">Deposit</button>
                </form>
            </div>

            {/* Borrow Section */}
            <div className="action-section">
                <h3>Borrow ETH</h3>
                <p>You must deposit collateral first (functionality not shown in this UI).</p>
                <form onSubmit={handleBorrow}>
                    <input
                        type="text"
                        placeholder="0.05 ETH"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        required
                    />
                    <button type="submit">Borrow</button>
                </form>
            </div>

            {/* Repay Section */}
            <div className="action-section">
                <h3>Repay Debt</h3>
                <form onSubmit={handleRepay}>
                    <input
                        type="text"
                        placeholder="0.05 ETH"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        required
                    />
                    <button type="submit">Repay</button>
                </form>
            </div>
        </div>
    );
};

export default Lending;