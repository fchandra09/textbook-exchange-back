import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class DownloadImages {
	private final static String OUTPUT_FOLDER = "books";

	public static void main(String[] args) {
		try {
			getBooks();
		}
		catch (Exception e) {
			System.out.println("Cannot get books.");
			e.printStackTrace();
		}

		System.out.println("Finished downloading images.");
	}

	private static void getBooks() throws Exception {
		URL obj = new URL("http://fa16-cs498rk-037.cs.illinois.edu:3000/api/books");
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		con.setRequestMethod("GET");
		con.setRequestProperty("Content-Type", "application/json; charset=utf-8");

		con.setDoOutput(true);

		int responseCode = con.getResponseCode();
		//System.out.println("Response Code : " + responseCode);

		BufferedReader in = new BufferedReader(
		        new InputStreamReader(con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();

		String responseStr = response.toString();
		//System.out.println("Response: " + responseStr);

		JSONParser parser = new JSONParser();
		Object responseObject = parser.parse(responseStr);
		JSONObject jsonObject = (JSONObject) responseObject;

		JSONArray books = (JSONArray) jsonObject.get("data");
		Iterator<JSONObject> iterator = books.iterator();
		while (iterator.hasNext()) {
			JSONObject book = iterator.next();
			String isbn = (String)book.get("isbn");
			String imageUrl = (String)book.get("image");

			downloadImage(isbn, imageUrl);
		}
	}

	private static void downloadImage(String isbn, String imageUrl) {
		String fileName = OUTPUT_FOLDER + "/" + isbn + ".jpg";

		try {
			File file = new File(fileName);
			if (!file.exists()) {
				URL url = new URL(imageUrl);
				InputStream inputStream = url.openStream();
				OutputStream outputStream = new FileOutputStream(fileName);

				byte[] b = new byte[2048];
				int length;

				while ((length = inputStream.read(b)) != -1) {
					outputStream.write(b, 0, length);
				}

				inputStream.close();
				outputStream.close();
			}
		}
		catch (Exception e) {
			System.out.println("ISBN: " + isbn);
			e.printStackTrace();
		}
	}
}
