import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import {Votingdapp} from '../target/types/votingdapp'
const IDL = require( '../target/idl/votingdapp.json');

const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

describe('votingdapp', () => {
  

  it('Initialize Poll', async () => {
    const context = await startAnchor("", [{name: "votingdapp", programId: votingAddress}], []);

    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );

    const pollId = new BN(1)
    const inputDescription = "What is your favorite food"
    const pollStartDate =  new BN(0)
    const pollEndDate = new BN(1821246480)

    await votingProgram.methods.initializePoll(
      pollId,
      inputDescription,
      pollStartDate,
      pollEndDate,
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [
        new BN(1).toArrayLike(Buffer, 'le',8)
      ],
      votingAddress
    )

    const poll = await votingProgram.account.poll.fetch(
      pollAddress
    );

    expect(poll.pollId.toNumber()).toEqual(pollId.toNumber());
    expect(poll.description.toString()).toEqual(inputDescription);
    expect(poll.pollStart.toNumber()).toEqual(pollStartDate.toNumber())
    expect(poll.pollEnd.toNumber()).toEqual(pollEndDate.toNumber()) 

  })
})


// https://youtu.be/amAq-WHAFs8?t=5240