import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class UpdateImages {
	private final static String API_URL = "http://fa16-cs498rk-037.cs.illinois.edu:3000/api/books";
	private final static String IMAGE_FOLDER = "C:/Users/Felicia/Documents/workspace/vagrant-dev/textbook-exchange-front/app/images/books/";

	public static void main(String[] args) {
		try {
			getBooks();
		}
		catch (Exception e) {
			System.out.println("Cannot get books.");
			e.printStackTrace();
		}

		System.out.println("Finished updating images.");
	}

	private static void getBooks() throws Exception {
		URL obj = new URL(API_URL);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		con.setRequestMethod("GET");
		con.setRequestProperty("Content-Type", "application/json; charset=utf-8");

		con.setDoOutput(true);

		BufferedReader in = new BufferedReader(
		        new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();

		String responseStr = response.toString();

		JSONParser parser = new JSONParser();
		Object responseObject = parser.parse(responseStr);
		JSONObject jsonObject = (JSONObject) responseObject;

		JSONArray books = (JSONArray) jsonObject.get("data");
		Iterator<JSONObject> iterator = books.iterator();
		while (iterator.hasNext()) {
			JSONObject book = iterator.next();
			String bookId = (String)book.get("_id");
			String isbn = (String)book.get("isbn");

			File file = new File(IMAGE_FOLDER + isbn + ".jpg");
			if (file.exists()) {
				book.put("image", isbn + ".jpg");
			}
			else {
				book.put("image", null);
			}

			updateBook(bookId, book);
		}
	}

	private static void updateBook(String bookId, JSONObject book) throws Exception {
		URL obj = new URL(API_URL + "/" + bookId);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		con.setRequestMethod("PUT");
		con.setRequestProperty("Content-Type", "application/json; charset=utf-8");

		con.setDoOutput(true);
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.writeBytes(book.toJSONString());
		wr.flush();
		wr.close();

		int responseCode = con.getResponseCode();
		//System.out.println("Response Code : " + responseCode);
	}
}
