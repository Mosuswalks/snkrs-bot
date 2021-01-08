const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const fs = require('fs');
const schedule = require('node-schedule')
const {installMouseHelper} = require('./extras/install_mouse_helper');
require('dotenv').config()

puppeteer.use(pluginStealth())

const runSnkrBot = () => {

	// Debugging stuff
	const html_path = 'htmls/bot_';
	const screenshot_path = 'screenshots/bot_';
	const SimpleNodeLogger = require('simple-node-logger'),
		opts = {
			logFilePath: 'logs/' + 'bot.log',
			timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
		};
	let html = '';


	// ####################################
	// ####################################
	// Parameters to set

	// user/pass: the email/username for your Nike.com account
	const email = process.env.EMAIL;
	const pass = process.env.PASS;

	// cvv_code: 3-digit credit card validation value for the card saved to your Nike.com account
	const cvv_code = process.env.CVV

	// size: the shoe size, as you see in the table of sizes on a product page, e.g., 'M 9 / W 10.5'
	const size = 'US M 9.5 / W 11';

	/* date: the date and time the shoe is being dropped at. Months will begin at zero so be sure to subratct one from any month.
		Date format should be as follows: (year, month - 1, day, hour, minute, seconds) 
	*/
	const date = new Date(2020, 4, 19, 23, 48, 30);

	// url: url to the shoe page, e.g., 'https://www.nike.com/us/launch/t/kobe-4-protro-wizenard/'
	const url = 'https://www.nike.com/ca/launch/t/air-jordan-1-court-purple';

	// debug: Use debug/logging features?
	// Includes writing updates to log file, writing html snapshots, and taking screenshots
	const debug = true;

	// buy: ****WARNING**** if you set this to true it *may* actually make a purchase
	// you can leave this to false and the bot will not "submit order"
	const buy = false;





	// ####################################
	// ####################################
	// main flow
	(async () => { 

		const browser = await puppeteer.launch({
			ignoreHTTPSErrors: true,
			headless: false
		});

		const page = await browser.newPage();
		
		if(debug == true){	
			await installMouseHelper(page); // Makes mouse visible
			
			var dir = './htmls';
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
			dir = './screenshots';
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
			dir = './logs';
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}
			
			log = SimpleNodeLogger.createSimpleFileLogger( opts );
			log.setLevel('info');	
			
		}
			
		await page.goto(url);
		page.waitForNavigation({ waitUntil: 'networkidle0' }); // Wait for page to finish loading
		

		
		// ##################################################
		// ##################################################
		// ################################## ROUND 1
		// BEGIN
		
		// #### LOG / DEBUG
		if(debug == true){	
			log.info('1. Page loaded');	
			html = await page.content();
			fs.writeFileSync(html_path + "_1_loaded_" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_1_loaded_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		await page.waitFor(500);
		

		// #### Login to Account
		await page.waitForSelector('button[data-qa="top-nav-join-or-login-button"]');
		console.log('Login button loaded')

		await page.evaluate(() => 
		document.querySelectorAll('button[data-qa="top-nav-join-or-login-button"]')[0].click())
		console.log("Testing login")

		await page.waitForSelector('.emailAddress');
		await page.waitFor(500);
			
		// Username
		await page.focus('.emailAddress > input');
		await page.keyboard.type(email);
		await page.waitFor(200);
			
		// Password
		await page.focus('.password > input')
		await page.keyboard.type(pass);
		await page.waitFor(200);
			
		// Submit
		await page.evaluate(() =>
			document.querySelectorAll(".loginSubmit > input")[0].click()
		);	
		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('2. Logged in');
			html = await page.content();
			fs.writeFileSync(html_path + "_2_logged_in__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_2_logged_in_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
			
		await page.waitFor(500);	
		


		
		// ##################################################
		// ##################################################
		// ################################## ROUND 2	
		// Wait for size selector to appear, then scroll to it
		schedule.scheduleJob(date, async () => {
			console.log("testing schedule")

		})
		

		
		await page.waitForSelector('.size-grid-dropdown');
		await page.evaluate(() =>
			document.querySelectorAll(".size-grid-dropdown")[0].scrollIntoView()
		);
		
		// #### LOG / DEBUG
		if(debug == true){	
			log.info('. Selectors appeared');	
			html = await page.content();
			fs.writeFileSync(html_path + "_3_selectors_" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_3_selectors_" + Math.floor(new Date() / 1000) + '.png'});	
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);
		


		// ##################################################
		// ##################################################
		// ################################## ROUND 3
		// Pick my size from the options
		
		
		await page.evaluate(async(size) => {
			let sizes = Array.from(document.querySelectorAll(".size-grid-dropdown"));
			let sizeIndex = sizes
				.map((s, i) => (s.innerHTML === size ? i : false))
				.filter(Boolean)[0];
			return sizes[sizeIndex].click();
		}, size);
		
		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('3. Found and clicked on size');
			html = await page.content();
			fs.writeFileSync(html_path + "_4_size_clicked__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_4_size_clicked_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);
		
		
		
		
		// ##################################################
		// ##################################################
		// ################################## ROUND 4	
		// Wait for add to cart button, then scroll into view
		
		await page.waitForSelector('button[data-qa="add-to-cart"]');
		await page.evaluate(() =>
			document.querySelectorAll('button[data-qa="add-to-cart"]')[0].scrollIntoView()
		);
		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('4. Scrolled to add button');
			html = await page.content();
			fs.writeFileSync(html_path + "_5_scroll_to_add_button__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_5_scroll_to_add_button_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);
		
		
		
		
		// ##################################################
		// ##################################################
		// ################################## ROUND 5	
		// Click the add to cart button
		
		await page.evaluate(() =>
			document.querySelectorAll('button[data-qa="add-to-cart"]')[0].click()
		);

		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('5. Clicked add button');
			html = await page.content();
			fs.writeFileSync(html_path + "_6_clicked_add_button__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_6_clicked_add_button_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);	
		
		
		
		
		// ##################################################
		// ##################################################
		// ################################## ROUND 7
		// Enter credit card info
		
		await page.waitForSelector('.credit-card-iframe');
		await page.waitForSelector('.credit-card-iframe');
		
		await page.evaluate(() =>
			document.querySelectorAll(".credit-card-iframe")[0].scrollIntoView()
		);
		await page.waitFor(200);
		
		const target_frame = page.frames().find(frame => frame.url().includes('paymentcc.nike.com'));
		
		await target_frame.evaluate(
			() => (document.getElementById("cvNumber").focus())
		);	
		await target_frame.waitFor(1000);
		await page.keyboard.type(cvv_code, {delay: 10});
		
		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('7. Entered CV');
			html = await page.content();
			fs.writeFileSync(html_path + "_7_entered_cv__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_7_entered_cv_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);	
		
		
		
		// ##################################################
		// ##################################################
		// ################################## ROUND 8
		// Click "Save & Continue"
		
		await page.waitForSelector('.save-button');
		const buttons = await page.$$('.save-button');

		await buttons[1].click();	
		
		//#### LOG / DEBUG
		if(debug == true){	
			log.info('8. Clicked Save & Continue');
			html = await page.content();
			fs.writeFileSync(html_path + "_8_save_continue__" + Math.floor(new Date() / 1000) + ".html", html);
			page.screenshot({path: screenshot_path + "_8_save_continue_" + Math.floor(new Date() / 1000) + '.png'});
		}
		//#### LOG / DEBUG END
		
		await page.waitFor(500);		
		
		
		
		
		
		// ##################################################
		// ##################################################
		// ################################## ROUND 9
		// Click "Submit Order"
		
		if(buy == true){
			await buttons[2].click();
			
			//#### LOG / DEBUG
			if(debug == true){	
				log.info('9. Submitted Order');
				html = await page.content();
				fs.writeFileSync(html_path + "_9_submitted_order__" + Math.floor(new Date() / 1000) + ".html", html);
				page.screenshot({path: screenshot_path + "_9_submitted_order_" + Math.floor(new Date() / 1000) + '.png'});
			}
			//#### LOG / DEBUG END
			
			await page.waitFor(500);
			
		}
		
		//await browser.close();
	})();
}

module.exports = runSnkrBot 