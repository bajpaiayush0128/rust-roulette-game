const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const web3 = require("@solana/web3.js");
const { getWalletBalance, transferSOL, airDropSol } = require("./solana");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require("./helper");
// NOTE! Remember to change the values of these keys!
const userPublicKey = [
  112, 11, 232, 192, 104, 68, 202, 109, 232, 158, 177, 209, 40, 215, 96, 68,
  101, 211, 139, 76, 100, 185, 255, 107, 190, 205, 45, 198, 123, 28, 200, 214,
];
const userSecretKey = [
  202, 2, 192, 24, 184, 162, 1, 183, 254, 141, 171, 0, 155, 68, 40, 160, 195,
  245, 215, 247, 226, 189, 40, 123, 158, 61, 195, 20, 58, 203, 48, 114, 112, 11,
  232, 192, 104, 68, 202, 189, 232, 158, 177, 209, 40, 215, 96, 68, 101, 211,
  139, 76, 100, 185, 255, 107, 190, 205, 45, 198, 123, 28, 200, 214,
];

const userWallet = web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
const treasuryWallet = web3.Keypair.fromSecretKey(
  Uint8Array.from(userSecretKey)
);

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("SOL Stake", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};

const askQuestions = () => {
  const questions = [
    {
      name: "SOL",
      type: "number",
      message: "What is the amount of SOL you want to stake?",
    },
    {
      type: "rawlist",
      name: "RATIO",
      message: "What is the ratio of your staking?",
      choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
      filter: function (val) {
        const stakeFactor = val.split(":")[1];
        return stakeFactor;
      },
    },
    {
      type: "number",
      name: "RANDOM",
      message: "Guess a random number from 1 to 5 (both 1, 5 included)",
      when: async (val) => {
        if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
          console.log(
            chalk.red`You have violated the max stake limit. Stake with a smaller amount.`
          );
          return false;
        } else {
          console.log(
            `You need to pay ${chalk.green`${totalAmtToBePaid(
              val.SOL
            )}`} to move forward.`
          );
          const userBalance = await getWalletBalance(
            userWallet.publicKey.toString()
          );
          if (userBalance < totalAmtToBePaid(val.SOL)) {
            console.log(
              chalk.red`You don't have enough balance in your wallet`
            );
            return false;
          } else {
            console.log(
              chalk.green`You will get ${getReturnAmount(
                val.SOL,
                parseFloat(val.RATIO)
              )} if guessing the number correctly`
            );
            return true;
          }
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

const gameExecution = async () => {
  init();
  const generateRandomNumber = randomNumber(1, 5);
  const answers = await askQuestions();
  if (answers.RANDOM) {
    const paymentSignature = await transferSOL(
      userWallet,
      treasuryWallet,
      totalAmtToBePaid(answers.SOL)
    );
    console.log(
      `Signature of payment for playing the game`,
      chalk.green`${paymentSignature}`
    );
    if (answers.RANDOM === generateRandomNumber) {
      // AirDrop the winning amount
      await airDropSol(
        treasuryWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      // The guess was successful
      const prizeSignature = await transferSOL(
        treasuryWallet,
        userWallet,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      console.log(chalk.green`Your guess is absolutely correct`);
      console.log(
        `Here is the price signature `,
        chalk.green`${prizeSignature}`
      );
    } else {
      // Better luck next time
      console.log(chalk.yellowBright`Better luck next time!`);
    }
  }
};

gameExecution();
