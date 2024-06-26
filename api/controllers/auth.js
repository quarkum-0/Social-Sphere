import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    // CHECK IF USER EXISTS
    const q = "SELECT * FROM users WHERE username = ?";
  
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");
        
        // CREATE A NEW USER
        // Hash the password
        const q = "INSERT INTO users (`username`, `email`, `password`, `name`) VALUES (?)";
        const values = [
            req.body.username,
            req.body.email,
            req.body.password,
            req.body.name,
        ];
  
        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("User has been created.");
        });
    });
};

export const login = (req, res) => {
    const q = "SELECT * FROM users WHERE username = ?";
  
    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");
  
        if (req.body.password !== data[0].password)
            return res.status(400).json("Wrong password or username!");
  
        const token = jwt.sign({ user_ID: data[0].user_ID}, "secretkey");
  
        const { password, ...others } = data[0];
  
        res.cookie("accessToken", token, {
            httpOnly: true,
        }).status(200).json(others);
    });
};
  
export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite: "none"
    }).status(200).json("User has been logged out.");
};
