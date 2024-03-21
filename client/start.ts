import * as web3 from "@solana/web3.js";

const main = async () => {
  const connection = new web3.Connection("http://127.0.0.1:8899", "finalized");

  const module1 = new web3.PublicKey(
    "JDqdB37sTRAoPhqauNSXxAvbVn7ST2sU4DxrscJyafx9"
  );

  const module2 = new web3.PublicKey(
    "3Missu7oyBqJuv3cZxJ6R9BEvVhKATMH2o2vCmb7D3Pd"
  );

  const payer = web3.Keypair.generate();

  console.log("payer address : ", payer.publicKey.toBase58());

  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    web3.LAMPORTS_PER_SOL * 5
  );

  console.log("Airdrop signature : ", airdropSignature);

  let latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    },
    "finalized"
  );

  console.log("Airdrop done successfully !!");

  const newBalance = await connection.getBalance(payer.publicKey);
  console.log("New balance : ", newBalance);

  const transaction = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: module1, isSigner: false, isWritable: false },
      ],
      programId: module2,
      data: Buffer.alloc(0), // All instructions are no-ops
    })
  );

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  console.log("Transaction signature", signature);

  latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    },
    "finalized"
  );

  console.log("Transaction done successfully !!");
};

main()
  .then(() => {
    console.log("Program done successfully !!");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
