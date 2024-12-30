import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import {Votingdapp} from '../target/types/votingdapp'
const IDL = require( '../target/idl/votingdapp.json');

const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

describe('votingdapp', () => {

  let context;
  let provider;
  let votingProgram: any;

  beforeAll(async ()=>{
    context = await startAnchor("", [{name: "votingdapp", programId: votingAddress}], []);

    provider = new BankrunProvider(context);

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );
  })

  it('Initialize Poll', async () => {

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

  it("Initialize candidate", async() =>{

    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new BN(1)
    ).rpc()

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new BN(1)
    ).rpc()

    const [smoothAddress]= PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le",8),
        Buffer.from("Smooth")
      ],
      votingAddress
    );

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, "le",8),
        Buffer.from("Crunchy")
      ],
      votingAddress
    );

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress)
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)

    expect(crunchyCandidate.candidateName).toEqual("Crunchy")
    expect(crunchyCandidate.candidateVotes.toString()).toEqual("0")

    expect(smoothCandidate.candidateName).toEqual("Smooth")
    expect(smoothCandidate.candidateVotes.toString()).toEqual("0")

  })
})
