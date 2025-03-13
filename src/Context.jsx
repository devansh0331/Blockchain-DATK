import { createContext, useState } from "react";

import { ethers } from "ethers";

export const Context = createContext({});

export function ContextProvider({ children }) {
  const [account, setAccount] = useState("Not connected");

  const contractAddress = "0x157A29C07bECFee1b87dbb44f9BdcB58127b5433"; // ToDoList Contract

  const todoABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "taskId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "task",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "timestamp",
          type: "string",
        },
      ],
      name: "TaskAdded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "taskId",
          type: "uint256",
        },
      ],
      name: "TaskDeleted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "taskId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "done",
          type: "bool",
        },
      ],
      name: "TaskMarkedAsDone",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "taskId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "task",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "timestamp",
          type: "string",
        },
      ],
      name: "TaskUpdated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
        {
          internalType: "string",
          name: "_task",
          type: "string",
        },
        {
          internalType: "string",
          name: "_timestamp",
          type: "string",
        },
      ],
      name: "addTask",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_taskId",
          type: "uint256",
        },
      ],
      name: "deleteUserTask",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
      ],
      name: "getUserTasks",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "taskId",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "task",
              type: "string",
            },
            {
              internalType: "string",
              name: "timestamp",
              type: "string",
            },
            {
              internalType: "bool",
              name: "done",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isUpdated",
              type: "bool",
            },
          ],
          internalType: "struct ToDoList.Task[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_taskId",
          type: "uint256",
        },
      ],
      name: "markAsDone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_taskId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_task",
          type: "string",
        },
        {
          internalType: "string",
          name: "_timestamp",
          type: "string",
        },
      ],
      name: "updateUserTask",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "userTasks",
      outputs: [
        {
          internalType: "uint256",
          name: "taskId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "task",
          type: "string",
        },
        {
          internalType: "string",
          name: "timestamp",
          type: "string",
        },
        {
          internalType: "bool",
          name: "done",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isUpdated",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const [contract, setContract] = useState();
  const [signer, setSigner] = useState();

  const handleContract = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum); //read the Blockchain
      const signer = provider.getSigner(); //write the blockchain

      //   const contractinterface = new ethers.Contract(
      //     contractAddress,
      //     contractABI,
      //     signer
      //   );
      setContract(new ethers.Contract(contractAddress, todoABI, signer));
      setSigner(signer);
      console.log("Contract: ", contract);
    } catch (err) {
      console.log("Error: " + err.message);
    }
  };
  return (
    <Context.Provider
      value={{
        account,
        setAccount,
        contractAddress,
        contract,
        handleContract,
        signer,
      }}
    >
      {children}
    </Context.Provider>
  );
}
