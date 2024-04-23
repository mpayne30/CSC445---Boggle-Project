import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class FileLineSeparator {

    public static void main(String[] args) {
        String inputFilePath = "10000il.txt"; // Specify your input file path here
        String outputFilePath = "10000bucketes.txt"; // Specify your output file path here

        try (BufferedReader reader = new BufferedReader(new FileReader(inputFilePath));
             FileWriter writer = new FileWriter(outputFilePath)) {

            Map<Character, StringBuilder> categorizedLines = new HashMap<>();

            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isEmpty()) {
                    char firstChar = Character.toUpperCase(line.charAt(0));
                    if (Character.isLetter(firstChar)) {
                        categorizedLines.putIfAbsent(firstChar, new StringBuilder());
                        StringBuilder categoryLines = categorizedLines.get(firstChar);
                        if (categoryLines.length() > 0) {
                            categoryLines.append(", ");
                        }
                        categoryLines.append('"').append(line).append('"');
                    }
                }
            }

            // Write the categorized lines to the output file
            for (Map.Entry<Character, StringBuilder> entry : categorizedLines.entrySet()) {
                char letter = entry.getKey();
                StringBuilder lines = entry.getValue();
                writer.write("Lines starting with '" + letter + "':\n");
                writer.write(lines.toString() + "\n\n");
            }

            System.out.println("Output file created successfully: " + outputFilePath);
        } catch (IOException e) {
            System.err.println("Error reading or writing files: " + e.getMessage());
        }
    }
}
