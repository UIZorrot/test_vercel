module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('MyContract', {
      from: deployer,
      args: ['Hello'],
      log: true,
    });
  };
  module.exports.tags = ['MyContract'];