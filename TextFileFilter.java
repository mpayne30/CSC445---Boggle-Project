import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class TextFileFilter {

    public static void main(String[] args) {
        String inputFile = "wordList.txt"; // Specify the input file path
        String outputFile = "output.txt"; // Specify the output file path

        try {
            filterTextFile(inputFile, outputFile);
            System.out.println("Filtered text file created successfully.");
        } catch (IOException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    public static void filterTextFile(String inputFile, String outputFile) throws IOException {
        Set<String> uniqueLines = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(inputFile));
             BufferedWriter writer = new BufferedWriter(new FileWriter(outputFile))) {

            String line;
            while ((line = reader.readLine()) != null) {
                // Convert line to lowercase
                String lowercaseLine = line.toLowerCase();

                // Check for duplicates (in lowercase)
                if (!uniqueLines.contains(lowercaseLine)) {
                    // Apply filters to the lowercase line
                    if (isValidLine(lowercaseLine)) {
                        writer.write(line); // Write original line to output file
                        writer.newLine();
                        uniqueLines.add(lowercaseLine); // Add lowercase line to set
                    }
                }
            }
        }
    }

    public static boolean isValidLine(String line) {
        // Define regular expression to match unwanted patterns
        String regex = ".*[.,\\d-].*"; // Matches if line contains period, comma, hyphen, or any digit
        String regexLetters = "[a-zA-Z]{3,9}"; // Matches if line has 3 to 9 letters
        String regexSingleLetterWords = "\\b[a-zA-Z]\\b"; // Matches if line contains a single-letter word

        // Check if line matches any of the unwanted patterns
        if (line.matches(regex) || !line.matches(regexLetters) || line.matches(regexSingleLetterWords)) {
            return false; // Line does not meet criteria
        }

        return true; // Line meets criteria
    }
}
