const ethers = require("ethers");
const fs = require("fs");


pir_k= "35bfd220f398e5f99d8ca6d77f6e9734d01a37c60f16a4e86d04163dc4b1c298";
rpc= "HTTP://127.0.0.1:8545";



async function main()
{
    const provider = new ethers.providers.JsonRpcBatchProvider(rpc);
    const wallet = new ethers.Wallet(pir_k,provider);
    const abi = fs.readFileSync("./helloworld_sol_helloworld.abi", "utf8");
    const bin = fs.readFileSync("./helloworld_sol_helloworld.bin", "utf8");
    const contract =  new ethers.ContractFactory(abi,bin,wallet);
    console.log("wait!");
    const contract_obj = await contract.deploy();
    console.log("suc!");
    const receipt = await contract_obj.deployTransaction.wait(1);
    console.log(receipt);
    console.log('contract address: ' + contract_obj.address);
}

main().then(
()=>process.exit(0)    
).catch( 
    (error) => {console.error(error);process.exit(1);}
);