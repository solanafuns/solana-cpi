import * as web3 from "@solana/web3.js";

const waitConfirmation = async (
  connection: web3.Connection,
  signature: string
) => {
  console.log("");
  console.log("Waiting for confirmation ", signature);
  let latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    },
    "finalized"
  );
  console.log(signature, "Confirmed");
  console.log("");
};
const main = async () => {
  const connection = new web3.Connection("http://127.0.0.1:8899", "finalized");

  const module = new web3.PublicKey(
    "5PmftGhnkH9YRrpd8suAC8rKuRn23P5KL9SE3dG9oLgA"
  );

  const main = new web3.PublicKey(
    "DEU8mc3yVmszucobpEuqkyKW8c2ZjsA2EzbqUwXLffzA"
  );

  console.log(
    "this will help execute module: ",
    module.toBase58(),
    "from main: ",
    main.toBase58()
  );

  const payer = web3.Keypair.generate();
  const oneUser = web3.Keypair.generate();

  console.log("payer address : ", payer.publicKey.toBase58());

  let users = [payer.publicKey, oneUser.publicKey];

  for (let i = 0; i < users.length; i++) {
    console.log("airdrop to : ", users[i].toBase58());
    const airdropSignature = await connection.requestAirdrop(
      users[i],
      web3.LAMPORTS_PER_SOL * 5
    );
    await waitConfirmation(connection, airdropSignature);
  }

  console.log("Airdrop done successfully !!");
  console.log("change owner of oneUser to main program");

  const transactionChangeOwner = new web3.Transaction().add(
    web3.SystemProgram.assign({
      accountPubkey: oneUser.publicKey,
      programId: main,
    })
  );

  const signatureChangeOwner = await web3.sendAndConfirmTransaction(
    connection,
    transactionChangeOwner,
    [oneUser]
  );
  await waitConfirmation(connection, signatureChangeOwner);

  console.log("Change owner done successfully !!");
  const newBalance = await connection.getBalance(payer.publicKey);
  console.log("New balance : ", newBalance);

  const transaction = new web3.Transaction().add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: module, isSigner: false, isWritable: false },
        { pubkey: oneUser.publicKey, isSigner: false, isWritable: true },
        {
          pubkey: web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: main,
      data: Buffer.alloc(0), // All instructions are no-ops
    })
  );

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  await waitConfirmation(connection, signature);

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
