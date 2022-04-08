import React from 'react';
import {useAccount, useProvider, useSignTypedData, useSigner} from 'wagmi';
import {Flex, Text, Box, Button} from 'theme-ui';
import {add, getUnixTime} from 'date-fns';
import {Constants} from '../../course/constants';
import {permitAndMint} from '../../course/course';
import {BigNumber} from 'ethers';

const Modal = ({isModalVisible, setModalVisible}) => {
  const provider = useProvider();
  const [, signMessage] = useSignTypedData();
  const [{data: accountData}] = useAccount();
  const [{data: signer}] = useSigner();

  const twoMonthsFromNow = add(new Date(), {months: 2});
  const expiry = getUnixTime(twoMonthsFromNow);

  const handleOnClickRegister = async () => {
    const {chainId} = await provider.getNetwork();
    const nonce = await provider.getTransactionCount(accountData.address);

    const types = {
      Permit: [
        {name: 'holder', type: 'address'},
        {name: 'spender', type: 'address'},
        {name: 'nonce', type: 'uint256'},
        {name: 'expiry', type: 'uint256'},
        {name: 'allowed', type: 'bool'}
      ]
    };

    const domain = {
      name: 'Dai Stablecoin',
      version: '1',
      chainId,
      verifyingContract: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'
    };

    const value = {
      holder: accountData.address,
      spender: Constants.LearningCurveContractAddress,
      nonce: BigNumber.from(nonce),
      expiry: BigNumber.from(expiry),
      allowed: true
    };

    const {data: message} = await signMessage({
      domain,
      types,
      value
    });

    const signature = message.substring(2);
    const r = '0x' + signature.substring(0, 64);
    const s = '0x' + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);

    await permitAndMint(signer, 100, nonce, expiry, v, r, s);
  };

  if (isModalVisible) {
    return (
      <Box
        sx={{
          backgroundColor: '#47556990',
          backgroundOpacity: 0.5,
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => {
          setModalVisible(false);
        }}
      >
        <Flex
          sx={{
            flexDirection: 'column',
            marginY: 'auto',
            paddingTop: '250px',
            gap: 0
          }}
        >
          <Flex
            sx={{
              width: '471px',
              height: '361px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              backgroundColor: '#212144',
              marginX: 'auto',
              flexDirection: 'column'
            }}
          >
            <Text
              sx={{
                color: '#fff',
                textAlign: 'center',
                margin: 'auto',
                fontWeight: 'bold'
              }}
            >
              To reveal the answer, you need to <br /> register for our course.
            </Text>
            <Flex sx={{flexDirection: 'column'}}>
              <Text
                sx={{
                  color: '#fff',
                  textAlign: 'center',
                  margin: 'auto',
                  fontWeight: 'bold'
                }}
              >
                You can do this by staking
              </Text>
              <Text
                sx={{
                  margin: 'auto',
                  color: '#8C65F7',
                  fontSize: '48px',
                  fontWeight: 'medium'
                }}
              >
                100 DAI
              </Text>
            </Flex>
            <Text
              sx={{
                width: '310px',
                color: '#fff',
                textAlign: 'center',
                margin: 'auto'
              }}
            >
              You can claim this DAI back after{' '}
              <Text sx={{fontWeight: 'bold'}}>two months</Text>. You{' '}
              <Text sx={{fontWeight: 'bold'}}>learn for free</Text> and we use
              the yield to keep the lights on.
            </Text>
          </Flex>
          <Flex
            sx={{
              width: '471px',
              height: '100px',
              borderBottomRightRadius: '12px',
              borderBottomLeftRadius: '12px',
              backgroundColor: '#343457',
              marginX: 'auto',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: '20px'
            }}
          >
            <Text
              sx={{
                color: '#fff',
                textDecoration: 'underline',
                justifySelf: 'end'
              }}
            >
              Learn More.
            </Text>
            <Button
              sx={{borderRadius: '4px', fontWeight: 'bold'}}
              onClick={handleOnClickRegister}
            >
              Register
            </Button>
          </Flex>
        </Flex>
      </Box>
    );
  } else {
    return null;
  }
};

export default Modal;
