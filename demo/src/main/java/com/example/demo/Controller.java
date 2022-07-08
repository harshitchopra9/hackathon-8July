package com.example.demo;
import org.springframework.web.bind.annotation.RestController;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

@RestController
public class Controller {
	
	  @PostMapping("/email")
	  HttpStatus newEmployee(@RequestBody Split split) {
		  
		 sendMail(split);
	    return HttpStatus.OK;
	  }
	  
	    public void sendMail(Split split) {

	        // Recipient's email ID needs to be mentioned.
	        String from = split.emaiId;

	        // Sender's email ID needs to be mentioned

	        // Assuming you are sending email from through gmails smtp
	        String host = "smtp.gmail.com";

	        // Get system properties
	        Properties properties = System.getProperties();

	        // Setup mail server
	        properties.put("mail.smtp.host", host);
	        properties.put("mail.smtp.port", "465");
	        properties.put("mail.smtp.ssl.enable", "true");
	        properties.put("mail.smtp.auth", "true");

	        // Get the Session object.// and pass username and password
	        Session session = Session.getInstance(properties, new javax.mail.Authenticator() {

	            protected PasswordAuthentication getPasswordAuthentication() {

	                return new PasswordAuthentication(from, "123@user");

	            }

	        });

	        // Used to debug SMTP issues
	        session.setDebug(true);
	        
	        for(Share item:split.shares) {
	        	String to = item.email;
	        	String subject = split.name +"Requested Amount "+item.amount;
	        	String msg = split.name +"Requested Amount "+item.amount+" through "+ item.vpa;

		        try {
		            // Create a default MimeMessage object.
		            MimeMessage message = new MimeMessage(session);

		            // Set From: header field of the header.
		            message.setFrom(new InternetAddress(from));

		            // Set To: header field of the header.
		            message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));

		            // Set Subject: header field
		            message.setSubject(subject);

		            // Now set the actual message
		            message.setText(msg);

		            System.out.println("sending...");
		            // Send message
		            Transport.send(message);
		            System.out.println("Sent message successfully....");
		        } catch (MessagingException mex) {
		            mex.printStackTrace();
		        }
	        	
	        }


	    }

}
