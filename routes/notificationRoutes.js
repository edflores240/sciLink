import { Router } from "express";
import axios from "axios";
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const createNotificationRoute = (isAuthenticated) => {
  const router = Router();
  const API_URL = process.env.API_URL;

  // Set a timeout for all axios requests
  const axiosInstance = axios.create({
    timeout: 5000, // 5 seconds timeout
  });

  // Route to render the notifications page
  router.get("/", isAuthenticated, async (req, res) => {
    const userInfo = req.session.userInfo;

    try {
      const notifications = await axiosInstance.get(
        `${API_URL}/notification/getByUserId?userId=${req.user.id}`
      );

      
      // console.log("NR notification data", notifications.data);
      res.render("notification.ejs", {
        user: req.user,
        userInfo: userInfo,
        notifications: notifications.data,
        messages: req.flash(""),
        title: "Notification",
      });
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).send('Error fetching notifications');
    }
  });

  // AJAX FUNCTIONS
  // Route to fetch notifications as JSON
  router.get("/fetch", isAuthenticated, async (req, res) => {
    try {
      const notifications = await axiosInstance.get(
        `${API_URL}/notification/getByUserId?userId=${req.user.id}`
      );

      res.json(notifications.data);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ error: 'Error fetching notifications' });
    }
  });

  router.get("/delete/:id", isAuthenticated, async (req, res) => {
    try {
      await axiosInstance.get(
        `${API_URL}/notification/delete/${req.params.id}`
      );

      res.redirect("/notification")
      
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ error: 'Error fetching notifications' });
    };
  });

  router.get("/unseen", isAuthenticated, async (req, res) => {
    try {
      const unseenNum = await axiosInstance.get(
        `${API_URL}/notification/unseen/${req.user.id}`
      );

      res.json(unseenNum.data);
    } catch (error) {
      console.error('Error fetching unseen notifications:', error.message);
      res.status(500).json({ error: 'Error fetching unseen notifications' });
    }
  });

  router.get('/markAsSeen', isAuthenticated, async (req, res) => {
    try {
      await axiosInstance.get(
        `${API_URL}/notification/seen/${req.user.id}`
      );
      res.sendStatus(200);
    } catch (error) {
      console.error('Error marking notifications as seen:', error.message);
      res.status(500).json({ error: 'Error marking notifications as seen' });
    }
  });

  return router;
};

export default createNotificationRoute;
