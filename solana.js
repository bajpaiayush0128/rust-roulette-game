const web3 = require("@solana/web3.js");

const transferSOL = async (from, to, transferAmt) => {
  try {
    const connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );
    //For checking whether the connection is successfully made
    // console.log(connection);

    // const userWallet=web3.Keypair.generate();
    // console.log(userWallet);
    const userWallet = web3.Keypair.fromSecretKey(
      Uint8Array.from(userSecretKey)
    );

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: new web3.PublicKey(from.publicKey.toString()),
        toPubkey: new web3.PublicKey(to.publicKey.toString()),
        lamports: web3.LAMPORTS_PER_SOL,
      })
    );

    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWalletInstance]
    );
    // console.log("Signature is ", signature);
    return signature;
  } catch (err) {
    console.log(err);
  }
};

const getWalletBalance = async (pubk) => {
  try {
    const connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );
    const balance = await connection.getBalance(new web3.PublicKey(pubk));
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async (wallet, transferAmt) => {
  try {
    const connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );
    const fromAirDropSignature = await connection.requestAirdrop(
      new web3.PublicKey(wallet.publicKey.toString()),
      transferAmt * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getWalletBalance,
  transferSOL,
  airDropSol,
};
