import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { getSimilarBooks } from '../data/books';

export default function BookDetailsScreen({ route, navigation }) {
  // Read parameters from route.params
  const { id, title, author, genre, year, description } = route.params;

  const similarBooks = getSimilarBooks(id);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>Author: {author}</Text>
      <Text style={styles.detail}>Genre: {genre}</Text>
      <Text style={styles.detail}>Year: {year}</Text>
      
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{description}</Text>

      <Text style={styles.sectionTitle}>Similar Books</Text>
      {similarBooks.map((book) => (
        <View key={book.id} style={styles.similarBookRow}>
          <Text style={styles.similarBookTitle}>{book.title}</Text>
          <Button 
            title="View Details" 
            // Push a new BookDetails screen onto the stack
            onPress={() => navigation.push('BookDetails', book)} 
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  similarBookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  similarBookTitle: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});
