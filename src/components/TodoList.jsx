import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Dialog,
  Card,
  Typography,
  IconButton,
  Textarea,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { ethers } from "ethers";
import { Context } from "../Context"; // Your context for wallet connection
import bg from "../assets/bg.jpg";

const TodoList = () => {
  const { account, setAccount, contract, handleContract } = useContext(Context);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimatedEthCost, setEstimatedEthCost] = useState("0");
  const [confirmMarkAsDone, setConfirmMarkAsDone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Fetch tasks from the smart contract
  const fetchTasks = async () => {
    if (account) {
      setLoading(true);
      try {
        const tasks = await contract.getUserTasks(account);
        setTodos(tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch tasks when the wallet is connected
  useEffect(() => {
    if (account) {
      fetchTasks();
    }
  }, [account]);

  // Estimate transaction cost
  const estimateTransactionCost = async (transactionFunction, ...args) => {
    try {
      const gasEstimate = await contract.estimateGas[transactionFunction](
        ...args
      );
      const gasPrice = await contract.provider.getGasPrice();
      const gasCost = gasEstimate.mul(gasPrice);
      const ethCost = ethers.utils.formatEther(gasCost);
      setEstimatedEthCost(ethCost);
    } catch (error) {
      console.error("Error estimating gas cost:", error);
      setEstimatedEthCost("0");
    }
  };

  // Add Task
  const handleAddTask = async () => {
    if (inputValue.trim() !== "") {
      try {
        const timestamp = new Date().toLocaleString();
        const tx = await contract.addTask(account, inputValue, timestamp);
        await tx.wait();
        setInputValue("");
        setOpenDialog(false);
        await fetchTasks();
      } catch (error) {
        console.error("Error adding task:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update Task
  const handleUpdateTask = async () => {
    if (editText.trim() !== "") {
      setLoading(true);
      try {
        const timestamp = new Date().toLocaleString();
        const tx = await contract.updateUserTask(
          account,
          editId,
          editText,
          timestamp
        );
        await tx.wait();
        setEditId(null);
        setEditText("");
        setOpenDialog(false);
        await fetchTasks();
      } catch (error) {
        console.error("Error updating task:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Mark as Done
  const handleMarkAsDone = async (taskId) => {
    setSelectedTaskId(taskId);
    setConfirmMarkAsDone(true);
    await estimateTransactionCost("markAsDone", account, taskId);
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    setSelectedTaskId(taskId);
    setConfirmDelete(true);
    await estimateTransactionCost("deleteUserTask", account, taskId);
  };

  // Confirm Mark as Done
  const confirmMarkAsDoneAction = async () => {
    setConfirmMarkAsDone(false);
    try {
      const tx = await contract.markAsDone(account, selectedTaskId);
      await tx.wait();
      await fetchTasks();
    } catch (error) {
      console.error("Error marking task as done:", error);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Delete
  const confirmDeleteAction = async () => {
    setConfirmDelete(false);
    try {
      const tx = await contract.deleteUserTask(account, selectedTaskId);
      await tx.wait();
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setAccount("");
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      await handleContract();
      await fetchTasks();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Open Add/Edit Dialog
  const openAddEditDialog = (isEdit = false, taskId = null, taskText = "") => {
    setEditId(isEdit ? taskId : null);
    setEditText(isEdit ? taskText : "");
    setInputValue(isEdit ? "" : inputValue);
    setOpenDialog(true);
    if (isEdit) {
      estimateTransactionCost(
        "updateUserTask",
        account,
        taskId,
        taskText,
        new Date().toLocaleString()
      );
    } else {
      estimateTransactionCost(
        "addTask",
        account,
        "",
        new Date().toLocaleString()
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Header Section */}
      <div className="w-full flex justify-between items-center p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8">
        <p className="text-gray-300 text-lg md:text-xl lg:text-2xl bg-blue-gray-900 p-2 rounded-md shadow-md">
          DApp Task Keeper
        </p>
        {account === "Not connected" || account === "" ? (
          <Button
            size="sm"
            onClick={connectWallet}
            className="flex justify-center bg-darkOff text-dark items-center gap-2 md:gap-3"
          >
            <img
              src="https://docs.material-tailwind.com/icons/metamask.svg"
              alt="metamask"
              className="h-5 w-5 md:h-6 md:w-6"
            />
            <span className="text-sm md:text-base">Connect with Metamask</span>
          </Button>
        ) : (
          <Button
            size="sm"
            className="flex justify-center hover:cursor-not-allowed hover:shadow-none bg-green-600 items-center gap-2 md:gap-3"
          >
            <img
              src="https://docs.material-tailwind.com/icons/metamask.svg"
              alt="metamask"
              className="h-5 w-5 md:h-6 md:w-6"
            />
            <span className="text-sm md:text-base">Wallet Connected</span>
          </Button>
        )}
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-2xl mx-auto p-4 bg-dark rounded-lg shadow-lg">
        <Typography
          variant="h3"
          className="text-center mb-4 md:mb-6 text-white text-2xl md:text-3xl lg:text-4xl"
        >
          Decentralized Application for <br /> TASK KEEPING
        </Typography>

        {/* Add Task Button */}
        <div className="flex justify-between w-full mb-4 md:mb-6">
          {account === "Not connected" || account === "" ? (
            <Button className="bg-blue-900" disabled>
              Add Task
            </Button>
          ) : (
            <Button
              className="bg-blue-900"
              onClick={() => openAddEditDialog(false)}
              disabled={!account || loading}
            >
              Add Task
            </Button>
          )}
          <p className="p-2 rounded-md font-semibold h-fit bg-blue-gray-900 text-white text-sm md:text-md">
            {account === "Not connected" || account === ""
              ? "Not connected"
              : `${account.slice(0, 5)}....${account.slice(-4)}`}
          </p>
        </div>

        {/* Task List */}
        {loading ? (
          <Typography className="text-white text-center">Loading...</Typography>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <Card key={todo.taskId} className="p-4 bg-darkOff">
                <div className="flex justify-between items-center">
                  <Typography
                    className={`text-darkText ${
                      todo.done ? "line-through" : ""
                    }`}
                  >
                    {todo.task}{" "}
                    <span className="text-sm text-text">
                      ({todo.timestamp})
                    </span>
                  </Typography>
                  <div className="flex gap-2">
                    <IconButton
                      color={todo.done ? "amber" : "green"}
                      onClick={() => handleMarkAsDone(todo.taskId)}
                      disabled={loading}
                    >
                      {todo.done ? (
                        <ArrowPathIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </IconButton>

                    <IconButton
                      color="blue"
                      onClick={() =>
                        openAddEditDialog(true, todo.taskId, todo.task)
                      }
                      disabled={loading}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>

                    <IconButton
                      color="red"
                      onClick={() => handleDeleteTask(todo.taskId)}
                      disabled={loading}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Task Dialog */}
        <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
          <div className="p-4 bg-darkOff rounded-md">
            <Typography variant="h5" className="mb-4 text-darkText">
              {editId !== null ? "Edit Task" : "Add Task"}
            </Typography>
            <Textarea
              type="text"
              label="Enter task"
              value={editId !== null ? editText : inputValue}
              onChange={(e) => {
                if (editId !== null) {
                  setEditText(e.target.value);
                  estimateTransactionCost(
                    "updateUserTask",
                    account,
                    editId,
                    e.target.value,
                    new Date().toLocaleString()
                  );
                } else {
                  setInputValue(e.target.value);
                  estimateTransactionCost(
                    "addTask",
                    account,
                    e.target.value,
                    new Date().toLocaleString()
                  );
                }
              }}
              className="mb-4 bg-dark"
            />
            <div className="flex items-center justify-between">
              <Button
                onClick={editId !== null ? handleUpdateTask : handleAddTask}
                disabled={loading}
                className={`mt-2 ${
                  editId !== null ? "bg-amber-500" : "bg-dark"
                }`}
              >
                {editId !== null ? "Update" : "Add"}
              </Button>
              <p className="text-dark text-md">
                Estimated ETH: {estimatedEthCost} ETH
              </p>
            </div>
          </div>
        </Dialog>

        {/* Mark as Done Confirmation Dialog */}
        <Dialog
          open={confirmMarkAsDone}
          handler={() => setConfirmMarkAsDone(false)}
        >
          <div className="p-4 bg-darkOff rounded-md">
            <Typography variant="h5" className="mb-4 text-darkText">
              Confirm Mark as Done
            </Typography>
            <Typography className="mb-4 text-darkText">
              Are you sure you want to mark this task as done?
            </Typography>
            <Typography className="mb-4 text-darkText">
              Estimated ETH: {estimatedEthCost} ETH
            </Typography>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setConfirmMarkAsDone(false)}
                className="bg-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmMarkAsDoneAction}
                className="bg-green-500"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete} handler={() => setConfirmDelete(false)}>
          <div className="p-4 bg-darkOff rounded-md">
            <Typography variant="h5" className="mb-4 text-darkText">
              Confirm Delete
            </Typography>
            <Typography className="mb-4 text-darkText">
              Are you sure you want to delete this task?
            </Typography>
            <Typography className="mb-4 text-darkText">
              Estimated ETH: {estimatedEthCost} ETH
            </Typography>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setConfirmDelete(false)}
                className="bg-gray-500"
              >
                Cancel
              </Button>
              <Button onClick={confirmDeleteAction} className="bg-red-500">
                Confirm
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default TodoList;
